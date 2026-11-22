import mongoose from 'mongoose';
import { localStore, generateId, isUsingMongo } from '../config/db.js';

export function createModel(name, schemaDefinition, collectionKey) {
  // 1. Create real Mongoose Schema and Model
  const mongooseSchema = new mongoose.Schema(schemaDefinition, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  let MongooseModel;
  try {
    MongooseModel = mongoose.model(name, mongooseSchema);
  } catch (e) {
    MongooseModel = mongoose.models[name];
  }

  // 2. Base Local Model Wrapper that mirrors Mongoose API perfectly
  class LocalQuery {
    constructor(collection, filter = {}) {
      this.collection = collection;
      this.filter = filter;
      this._sort = null;
      this._limit = null;
      this._skip = null;
      this._populateFields = [];
    }

    sort(sortSpec) {
      this._sort = sortSpec;
      return this;
    }

    limit(n) {
      this._limit = n;
      return this;
    }

    skip(n) {
      this._skip = n;
      return this;
    }

    populate(path, select) {
      this._populateFields.push({ path, select });
      return this;
    }

    async exec() {
      let results = this.collection.filter(item => matchFilter(item, this.filter));

      // Sorting
      if (this._sort) {
        if (typeof this._sort === 'string') {
          const parts = this._sort.split(' ');
          parts.forEach(part => {
            const desc = part.startsWith('-');
            const field = desc ? part.substring(1) : part;
            results.sort((a, b) => {
              if (a[field] < b[field]) return desc ? 1 : -1;
              if (a[field] > b[field]) return desc ? -1 : 1;
              return 0;
            });
          });
        } else if (typeof this._sort === 'object') {
          for (const [key, dir] of Object.entries(this._sort)) {
            const desc = dir === -1 || dir === 'desc';
            results.sort((a, b) => {
              const valA = a[key] ?? '';
              const valB = b[key] ?? '';
              if (valA < valB) return desc ? 1 : -1;
              if (valA > valB) return desc ? -1 : 1;
              return 0;
            });
          }
        }
      }

      if (this._skip) {
        results = results.slice(this._skip);
      }
      if (this._limit) {
        results = results.slice(0, this._limit);
      }

      // Deep clone to prevent mutation
      results = JSON.parse(JSON.stringify(results));

      // Handle populate
      if (this._populateFields.length > 0) {
        for (const item of results) {
          for (const pop of this._populateFields) {
            const field = pop.path;
            const refVal = item[field];
            if (!refVal) continue;

            const targetId = typeof refVal === 'object' && refVal._id ? refVal._id : refVal;
            // Search across known collections: users, organizations, opportunities
            let found = localStore.getCollection('users').find(u => u._id === targetId || u.id === targetId);
            if (!found) {
              found = localStore.getCollection('organizations').find(o => o._id === targetId || o.id === targetId);
            }
            if (!found) {
              found = localStore.getCollection('opportunities').find(op => op._id === targetId || op.id === targetId);
            }

            if (found) {
              const populatedObj = { ...found };
              delete populatedObj.password;
              item[field] = populatedObj;
            }
          }
        }
      }

      return results;
    }

    then(resolve, reject) {
      return this.exec().then(resolve, reject);
    }
  }

  function matchFilter(item, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const [key, rule] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(rule)) {
        const matchesOr = rule.some(subFilter => matchFilter(item, subFilter));
        if (!matchesOr) return false;
        continue;
      }

      if (key === '$and' && Array.isArray(rule)) {
        const matchesAnd = rule.every(subFilter => matchFilter(item, subFilter));
        if (!matchesAnd) return false;
        continue;
      }

      const itemVal = item[key];

      if (rule && typeof rule === 'object' && !Array.isArray(rule)) {
        if (rule.$regex) {
          const flags = rule.$options || '';
          const reg = new RegExp(rule.$regex, flags);
          if (!reg.test(String(itemVal || ''))) return false;
          continue;
        }
        if (rule.$in && Array.isArray(rule.$in)) {
          if (Array.isArray(itemVal)) {
            const hasAny = rule.$in.some(v => itemVal.includes(v));
            if (!hasAny) return false;
          } else if (!rule.$in.includes(itemVal)) {
            return false;
          }
          continue;
        }
        if (rule.$ne !== undefined) {
          if (itemVal === rule.$ne) return false;
          continue;
        }
        if (rule.$gte !== undefined) {
          if (itemVal < rule.$gte) return false;
        }
        if (rule.$lte !== undefined) {
          if (itemVal > rule.$lte) return false;
        }
        continue;
      }

      if (Array.isArray(itemVal) && !Array.isArray(rule)) {
        if (!itemVal.includes(rule)) return false;
      } else if (itemVal !== rule) {
        return false;
      }
    }
    return true;
  }

  const LocalModel = {
    find(filter = {}) {
      const coll = localStore.getCollection(collectionKey);
      return new LocalQuery(coll, filter);
    },

    findOne(filter = {}) {
      const query = this.find(filter).limit(1);
      return {
        sort: (s) => query.sort(s),
        populate: (p, sel) => query.populate(p, sel),
        async exec() {
          const list = await query.exec();
          return list[0] || null;
        },
        then(resolve, reject) {
          return this.exec().then(resolve, reject);
        }
      };
    },

    findById(id) {
      return this.findOne({ _id: id });
    },

    async create(docData) {
      const coll = localStore.getCollection(collectionKey);
      const now = new Date().toISOString();
      const doc = {
        _id: docData._id || generateId(),
        ...docData,
        createdAt: docData.createdAt || now,
        updatedAt: now
      };
      coll.unshift(doc);
      localStore.save();
      return JSON.parse(JSON.stringify(doc));
    },

    async insertMany(docs) {
      const inserted = [];
      for (const d of docs) {
        const item = await this.create(d);
        inserted.push(item);
      }
      return inserted;
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      const coll = localStore.getCollection(collectionKey);
      const index = coll.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;

      const current = coll[index];
      let updatedData = { ...current };

      if (update.$set) {
        updatedData = { ...updatedData, ...update.$set };
      } else {
        updatedData = { ...updatedData, ...update };
      }

      if (update.$addToSet) {
        for (const [arrKey, val] of Object.entries(update.$addToSet)) {
          if (!Array.isArray(updatedData[arrKey])) updatedData[arrKey] = [];
          if (!updatedData[arrKey].includes(val)) {
            updatedData[arrKey].push(val);
          }
        }
      }

      if (update.$pull) {
        for (const [arrKey, val] of Object.entries(update.$pull)) {
          if (Array.isArray(updatedData[arrKey])) {
            updatedData[arrKey] = updatedData[arrKey].filter(v => v !== val && (v._id ? v._id !== val : true));
          }
        }
      }

      if (update.$inc) {
        for (const [numKey, val] of Object.entries(update.$inc)) {
          updatedData[numKey] = (updatedData[numKey] || 0) + val;
        }
      }

      updatedData.updatedAt = new Date().toISOString();
      coll[index] = updatedData;
      localStore.save();
      return JSON.parse(JSON.stringify(options.new ? updatedData : current));
    },

    async findByIdAndDelete(id) {
      const coll = localStore.getCollection(collectionKey);
      const index = coll.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      const removed = coll.splice(index, 1)[0];
      localStore.save();
      return removed;
    },

    async deleteMany(filter = {}) {
      const coll = localStore.getCollection(collectionKey);
      let count = 0;
      for (let i = coll.length - 1; i >= 0; i--) {
        if (matchFilter(coll[i], filter)) {
          coll.splice(i, 1);
          count++;
        }
      }
      localStore.save();
      return { deletedCount: count };
    },

    async countDocuments(filter = {}) {
      const items = await this.find(filter).exec();
      return items.length;
    }
  };

  // Return a proxy that switches to Mongoose if MongoDB is active, otherwise LocalModel
  return new Proxy(LocalModel, {
    get(target, prop) {
      if (isUsingMongo && MongooseModel && typeof MongooseModel[prop] !== 'undefined') {
        return MongooseModel[prop];
      }
      return target[prop];
    }
  });
}
