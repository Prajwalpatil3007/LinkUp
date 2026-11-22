import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';

export const getUsers = async (req, res) => {
  try {
    const { search, role, skill, interest, location, matchForUserId } = req.query;
    let users = await User.find({ isSuspended: false });

    // Filter by search keyword
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q)) ||
        (u.location && u.location.toLowerCase().includes(q)) ||
        (u.skills && u.skills.some(s => s.toLowerCase().includes(q))) ||
        (u.interests && u.interests.some(i => i.toLowerCase().includes(q)))
      );
    }

    // Role filter
    if (role && role !== 'All') {
      users = users.filter(u => u.roles && u.roles.includes(role));
    }

    // Location filter
    if (location) {
      const loc = location.toLowerCase();
      users = users.filter(u => u.location && u.location.toLowerCase().includes(loc));
    }

    // Skill filter
    if (skill) {
      const sk = skill.toLowerCase();
      users = users.filter(u => u.skills && u.skills.some(s => s.toLowerCase().includes(sk)));
    }

    // Interest filter
    if (interest) {
      const it = interest.toLowerCase();
      users = users.filter(u => u.interests && u.interests.some(i => i.toLowerCase().includes(it)));
    }

    // Rule-based skill & interest matching if user is authenticated or matchForUserId provided
    const targetUserId = matchForUserId || (req.user ? req.user._id : null);
    if (targetUserId) {
      const currentUser = await User.findById(targetUserId);
      if (currentUser) {
        const userSkills = (currentUser.skills || []).map(s => s.toLowerCase());
        const userInterests = (currentUser.interests || []).map(i => i.toLowerCase());

        users = users.map(u => {
          let matchScore = 0;
          const uSkills = (u.skills || []).map(s => s.toLowerCase());
          const uInterests = (u.interests || []).map(i => i.toLowerCase());

          // Count overlapping skills
          const sharedSkills = uSkills.filter(s => userSkills.includes(s));
          matchScore += sharedSkills.length * 3;

          // Count overlapping interests
          const sharedInterests = uInterests.filter(i => userInterests.includes(i));
          matchScore += sharedInterests.length * 2;

          // Same location bonus
          if (u.location && currentUser.location && u.location.toLowerCase() === currentUser.location.toLowerCase()) {
            matchScore += 2;
          }

          return {
            ...u,
            matchScore,
            sharedSkills,
            sharedInterests
          };
        });

        // Exclude current user from suggested list
        users = users.filter(u => u._id !== targetUserId && u.id !== targetUserId);

        // Sort descending by match score, then name
        users.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }
    }

    // Sanitize passwords
    const sanitized = users.map(u => {
      const obj = { ...u };
      delete obj.password;
      return obj;
    });

    res.status(200).json({ success: true, count: sanitized.length, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const profile = await Profile.findOne({ user: user._id });

    const userObj = { ...user };
    delete userObj.password;

    res.status(200).json({ success: true, user: userObj, profile: profile || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, bio, location, skills, interests, avatar, roles } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (avatar) updateData.avatar = avatar;
    if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (interests) updateData.interests = Array.isArray(interests) ? interests : interests.split(',').map(i => i.trim());
    if (roles && Array.isArray(roles) && roles.length > 0) updateData.roles = roles;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    const userObj = { ...updatedUser };
    delete userObj.password;

    res.status(200).json({ success: true, message: 'Profile details updated.', user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email roles avatar location skills bio');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { headline, education, experience, expertise, availability, projectExperience, socialLinks } = req.body;
    let profile = await Profile.findOne({ user: req.user._id });

    const updateFields = {
      headline: headline ?? (profile ? profile.headline : ''),
      education: education ?? (profile ? profile.education : []),
      experience: experience ?? (profile ? profile.experience : []),
      expertise: expertise ?? (profile ? profile.expertise : []),
      availability: availability ?? (profile ? profile.availability : 'Flexible'),
      projectExperience: projectExperience ?? (profile ? profile.projectExperience : ''),
      socialLinks: socialLinks ?? (profile ? profile.socialLinks : {})
    };

    if (!profile) {
      profile = await Profile.create({
        user: req.user._id,
        ...updateFields
      });
    } else {
      profile = await Profile.findByIdAndUpdate(profile._id, updateFields, { new: true });
    }

    res.status(200).json({ success: true, message: 'Detailed profile updated successfully.', profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
