import { User, hashPassword } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Organization } from '../models/Organization.js';
import { Opportunity } from '../models/Opportunity.js';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Project } from '../models/Project.js';
import { Community } from '../models/Community.js';
import { CommunityMember } from '../models/CommunityMember.js';
import { CommunityPost } from '../models/CommunityPost.js';
import { Resource } from '../models/Resource.js';
import { Notification } from '../models/Notification.js';

export const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already contains ${userCount} users. Skipping seeding.`);
      return;
    }

    console.log('[Seed] Seeding realistic LinkUp platform demo data across all 8 fields...');

    const defaultPassword = await hashPassword('Password123!');

    // 1. Create Core Users representing all participant types
    const usersData = [
      {
        name: 'LinkUp Administrator',
        email: 'admin@linkup.org',
        password: defaultPassword,
        roles: ['Administrator'],
        location: 'Bengaluru, India',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'LinkUp Platform Administrator overseeing ecosystem health, verified organizations, and safe collaboration.',
        skills: ['Platform Moderation', 'Community Operations', 'Digital Policy', 'System Architecture'],
        interests: ['Community Empowerment', 'Digital Equity', 'Educational Outreach']
      },
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@university.edu',
        password: defaultPassword,
        roles: ['Student'],
        location: 'Seattle, WA',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        bio: 'Senior Computer Science student passionate about machine learning, accessible web tools, and student hackathons.',
        skills: ['Python', 'React', 'Machine Learning', 'Data Analysis', 'Git'],
        interests: ['Academics and Research', 'Technology and Digital Awareness', 'Environment and Sustainability']
      },
      {
        name: 'Robert Martinez',
        email: 'robert.martinez@gmail.com',
        password: defaultPassword,
        roles: ['Individual Resident'],
        location: 'Austin, TX',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bio: 'Local resident and neighborhood coordinator organizing community assistance and digital literacy programs for seniors.',
        skills: ['Community Organizing', 'Volunteer Coordination', 'Public Speaking', 'Senior Outreach'],
        interests: ['Social Service and Community Support', 'Technology and Digital Awareness']
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@techlead.io',
        password: defaultPassword,
        roles: ['Professional / Mentor'],
        location: 'San Francisco, CA',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        bio: 'Principal Software Architect & IEEE mentor helping students and early-career developers transition into tech.',
        skills: ['System Design', 'Cloud Architecture', 'Mentorship', 'Resume Review', 'Go', 'Distributed Systems'],
        interests: ['Career and Professional Development', 'Academics and Research']
      },
      {
        name: 'David Kim',
        email: 'david.kim@civicreach.org',
        password: defaultPassword,
        roles: ['NGO Representative'],
        location: 'Chicago, IL',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        bio: 'Program Director at CivicReach Foundation mobilizing volunteers for civic education and educational equality.',
        skills: ['Non-Profit Management', 'Grant Writing', 'Field Operations', 'Community Advocacy'],
        interests: ['Social Service and Community Support', 'Financial and Digital Awareness']
      },
      {
        name: 'Prof. Elena Rostova',
        email: 'elena.rostova@metro-edu.ac',
        password: defaultPassword,
        roles: ['Educational Institution Representative'],
        location: 'Boston, MA',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        bio: 'Dean of Research at Metro University coordinating inter-institutional undergraduate research teams and seminars.',
        skills: ['Academic Research', 'Peer Review', 'Curriculum Design', 'Grant Coordination'],
        interests: ['Academics and Research', 'Career and Professional Development']
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@greenwaveinnovations.io',
        password: defaultPassword,
        roles: ['Startup / Business Representative'],
        location: 'Denver, CO',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        bio: 'Founder at GreenWave Innovations building circular economy software and searching for student tech co-founders.',
        skills: ['Product Strategy', 'CleanTech', 'Fundraising', 'FastAPI', 'UI/UX Design'],
        interests: ['Entrepreneurship and Startups', 'Environment and Sustainability']
      },
      {
        name: 'Maya Patel',
        email: 'maya.patel@communityroots.org',
        password: defaultPassword,
        roles: ['Opportunity Organiser'],
        location: 'Atlanta, GA',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        bio: 'Public health advocate and community workshop organizer promoting preventive care and healthy living.',
        skills: ['Public Health Education', 'Event Management', 'First Aid Instruction', 'Workshop Facilitation'],
        interests: ['Health and Well-being', 'Social Service and Community Support']
      }
    ];

    const users = [];
    for (const u of usersData) {
      const createdUser = await User.create(u);
      users.push(createdUser);

      // Create linked Profile
      await Profile.create({
        user: createdUser._id,
        headline: `${createdUser.roles[0]} • LinkUp Active Contributor`,
        education: [
          {
            institution: 'Metro State University',
            degree: 'Bachelor of Science',
            fieldOfStudy: createdUser.roles.includes('Student') ? 'Computer Science' : 'Applied Sciences',
            startYear: '2021',
            endYear: '2025'
          }
        ],
        experience: [
          {
            title: createdUser.roles[0],
            organization: 'Community Collaboration Network',
            description: createdUser.bio,
            startYear: '2022',
            endYear: 'Present'
          }
        ],
        expertise: createdUser.skills,
        availability: 'Flexible',
        projectExperience: 'Contributed to multiple community initiatives and collaborative research projects.',
        joinedCommunities: [],
        participationHistory: []
      });
    }

    const [admin, sarah, robert, priya, david, elena, marcus, maya] = users;

    // 2. Create Organizations
    const orgsData = [
      {
        name: 'CivicReach Foundation',
        description: 'A nationwide NGO committed to bridging digital divides and providing grassroots community learning programs.',
        category: 'Social Service and Community Support',
        type: 'NGO',
        website: 'https://civicreach.org',
        location: 'Chicago, IL',
        contactEmail: 'contact@civicreach.org',
        contactPhone: '+1 (312) 555-0199',
        logo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80',
        verificationStatus: 'Verified',
        verificationNotes: 'Registered 501(c)(3) verified with official state registry documents.',
        createdBy: david._id,
        members: [david._id]
      },
      {
        name: 'Metro University Computing Lab',
        description: 'Academic research facility facilitating student hackathons, coding workshops, and peer-reviewed research.',
        category: 'Academics and Research',
        type: 'Educational Institution',
        website: 'https://metro-edu.ac/computing',
        location: 'Boston, MA',
        contactEmail: 'computing@metro-edu.ac',
        contactPhone: '+1 (617) 555-0144',
        logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
        verificationStatus: 'Verified',
        verificationNotes: 'Accredited university department with verified institutional credentials.',
        createdBy: elena._id,
        members: [elena._id]
      },
      {
        name: 'GreenWave Innovations',
        description: 'Climate-tech startup incubator and enterprise fostering sustainable community recycling and renewable energy projects.',
        category: 'Environment and Sustainability',
        type: 'Startup / Business',
        website: 'https://greenwaveinnovations.io',
        location: 'Denver, CO',
        contactEmail: 'team@greenwaveinnovations.io',
        contactPhone: '+1 (303) 555-0182',
        logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80',
        verificationStatus: 'Verified',
        verificationNotes: 'Incorporated startup verified via corporate filing certificate.',
        createdBy: marcus._id,
        members: [marcus._id]
      },
      {
        name: 'SilverTech Digital Literacy Guild',
        description: 'Volunteer alliance providing smartphone and online safety workshops for senior citizens and local residents.',
        category: 'Technology and Digital Awareness',
        type: 'Community Group',
        website: 'https://silvertech-inclusion.org',
        location: 'Austin, TX',
        contactEmail: 'info@silvertech-inclusion.org',
        contactPhone: '+1 (512) 555-0128',
        logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
        verificationStatus: 'Verified',
        verificationNotes: 'Community initiative verified by local municipal civic board.',
        createdBy: robert._id,
        members: [robert._id]
      }
    ];

    const orgs = [];
    for (const o of orgsData) {
      const createdOrg = await Organization.create(o);
      orgs.push(createdOrg);
    }

    const [civicReach, metroLab, greenWave, silverTech] = orgs;

    // 3. Create Unified Opportunities covering ALL 8 APPROVED CATEGORIES
    const opportunitiesData = [
      // 1. Academics and Research
      {
        title: 'Open Source AI for Climate Forecasting Research Study',
        description: 'Join a cross-university undergraduate research collaboration analyzing satellite temperature datasets using PyTorch to forecast local heat dome anomalies.',
        category: 'Academics and Research',
        type: 'Research Collaboration',
        mode: 'Online',
        location: 'Remote / Online',
        skillsRequired: ['Python', 'PyTorch', 'Data Analysis', 'Scientific Writing'],
        eligibility: 'Undergraduate or graduate students with basic machine learning knowledge',
        startDate: '2026-12-01',
        endDate: '2027-03-31',
        deadline: '2026-11-30',
        availablePositions: 4,
        contactInfo: 'computing@metro-edu.ac',
        organizer: elena._id,
        organization: metroLab._id,
        status: 'Open',
        isAssistanceRequest: false
      },
      // 2. Technology and Digital Awareness (Community Assistance Request)
      {
        title: 'Smartphone & Digital Public Services Clinic for Senior Citizens',
        description: 'Community volunteers needed to sit 1-on-1 with local elderly residents to help them configure smartphones, use messaging apps securely, and access telehealth portals.',
        category: 'Technology and Digital Awareness',
        type: 'Community Assistance Request',
        mode: 'Offline',
        location: 'Austin Senior Civic Center, Austin, TX',
        skillsRequired: ['Patience', 'Smartphone Basics', 'Empathy', 'Basic Computer Education'],
        eligibility: 'Any friendly volunteer or student comfortable with iOS or Android smartphones',
        startDate: '2026-12-05',
        endDate: '2026-12-05',
        deadline: '2026-12-03',
        availablePositions: 6,
        contactInfo: 'info@silvertech-inclusion.org',
        organizer: robert._id,
        organization: silverTech._id,
        status: 'Open',
        isAssistanceRequest: true,
        assistanceDetails: {
          urgency: 'High',
          requesterType: 'Community Group',
          preferredDate: '2026-12-05',
          preferredTime: '10:00 AM - 1:00 PM',
          beneficiaryGroup: 'Elderly Community Residents',
          adminApproved: true
        }
      },
      // 3. Social Service and Community Support
      {
        title: 'Weekend Math & Science Tutoring for Underprivileged School Students',
        description: 'Help provide foundational STEM tutoring for middle school students from underserved neighborhoods. Course materials and structured exercise sheets are provided.',
        category: 'Social Service and Community Support',
        type: 'NGO Volunteering',
        mode: 'Hybrid',
        location: 'Chicago Community Center & Online Zoom',
        skillsRequired: ['Mathematics', 'Basic Science', 'Teaching', 'Communication'],
        eligibility: 'High school or college students and working professionals passionate about education',
        startDate: '2026-12-10',
        endDate: '2027-02-28',
        deadline: '2026-12-08',
        availablePositions: 8,
        contactInfo: 'volunteer@civicreach.org',
        organizer: david._id,
        organization: civicReach._id,
        status: 'Open',
        isAssistanceRequest: false
      },
      // 4. Entrepreneurship and Startups
      {
        title: 'Seeking Full-Stack Co-Founder for Circular Economy Food-Rescue App',
        description: 'GreenWave Innovations is building an algorithmic surplus food redistribution engine connecting dining halls with food pantries. Looking for a passionate student or early developer co-founder.',
        category: 'Entrepreneurship and Startups',
        type: 'Startup Collaboration',
        mode: 'Online',
        location: 'Denver, CO & Remote',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'System Architecture', 'Product Design'],
        eligibility: 'Full-stack developers interested in social entrepreneurship and green tech startups',
        startDate: '2026-12-15',
        endDate: '2027-06-30',
        deadline: '2026-12-12',
        availablePositions: 2,
        contactInfo: 'marcus@greenwaveinnovations.io',
        organizer: marcus._id,
        organization: greenWave._id,
        status: 'Open',
        isAssistanceRequest: false
      },
      // 5. Career and Professional Development
      {
        title: '1-on-1 Software Engineering Career Mentorship & Mock Interviews',
        description: 'A 6-week mentorship track pairing students and self-taught developers with seasoned senior engineers for resume reviews, coding interview prep, and career pathing.',
        category: 'Career and Professional Development',
        type: 'Mentorship & Guidance',
        mode: 'Online',
        location: 'Remote (Virtual Meetings)',
        skillsRequired: ['Software Development', 'Interview Preparation', 'Resume Building', 'Career Planning'],
        eligibility: 'Students in their penultimate or final year seeking software roles',
        startDate: '2026-12-12',
        endDate: '2027-01-23',
        deadline: '2026-12-07',
        availablePositions: 5,
        contactInfo: 'priya.sharma@techlead.io',
        organizer: priya._id,
        status: 'Open',
        isAssistanceRequest: false
      },
      // 6. Environment and Sustainability
      {
        title: 'Urban Native Tree Plantation & Micro-Forest Stewardship Drive',
        description: 'Hands-on ecological initiative planting 300 drought-tolerant native saplings and installing rainwater retention trenches across municipal parklands.',
        category: 'Environment and Sustainability',
        type: 'NGO Volunteering',
        mode: 'Offline',
        location: 'Greenwood Valley Park, Denver, CO',
        skillsRequired: ['Tree Planting', 'Environmental Awareness', 'Teamwork', 'Physical Stamina'],
        eligibility: 'All students, families, and community members welcome',
        startDate: '2026-12-06',
        endDate: '2026-12-06',
        deadline: '2026-12-04',
        availablePositions: 25,
        contactInfo: 'action@greenwaveinnovations.io',
        organizer: marcus._id,
        organization: greenWave._id,
        status: 'Open',
        isAssistanceRequest: false
      },
      // 7. Financial and Digital Awareness
      {
        title: 'Small Business Digital Payments & Cyber Safety Clinic',
        description: 'Interactive weekend workshops teaching neighborhood shop owners and local artisans how to safely adopt digital payments, identify phishing scams, and secure mobile banking.',
        category: 'Financial and Digital Awareness',
        type: 'Workshop & Seminar',
        mode: 'Offline',
        location: 'Civic Guild Hall, Chicago, IL',
        skillsRequired: ['Digital Payments', 'Online Banking Basics', 'Cybersecurity Awareness', 'Local Business Support'],
        eligibility: 'Volunteers and business students with good digital awareness',
        startDate: '2026-12-13',
        endDate: '2026-12-14',
        deadline: '2026-12-10',
        availablePositions: 4,
        contactInfo: 'support@civicreach.org',
        organizer: david._id,
        organization: civicReach._id,
        status: 'Open',
        isAssistanceRequest: false
      },
      // 8. Health and Well-being
      {
        title: 'Community Preventive Health Screening & CPR Literacy Workshop',
        description: 'Certified medical educators and student volunteers hosting free blood pressure screenings, preventive lifestyle guidance, and hands-only CPR training for neighborhood families.',
        category: 'Health and Well-being',
        type: 'Workshop & Seminar',
        mode: 'Offline',
        location: 'Atlanta Community Health Pavilion, Atlanta, GA',
        skillsRequired: ['First Aid / CPR Basics', 'Public Health Education', 'Empathy', 'Event Assistance'],
        eligibility: 'Nursing/pre-med students, health educators, and community volunteers',
        startDate: '2026-12-20',
        endDate: '2026-12-20',
        deadline: '2026-12-16',
        availablePositions: 10,
        contactInfo: 'maya.patel@communityroots.org',
        organizer: maya._id,
        status: 'Open',
        isAssistanceRequest: false
      },
      // Additional Assistance Request 2
      {
        title: 'Assistance Needed: Setting up Computer Lab for Local Immigrant Literacy Class',
        description: 'Our community center received donated laptops. We need tech-savvy student volunteers to install Ubuntu/browser setups, configure Wi-Fi, and set up basic typing tutorials for new adult learners.',
        category: 'Technology and Digital Awareness',
        type: 'Community Assistance Request',
        mode: 'Offline',
        location: 'Eastside Community Center, Austin, TX',
        skillsRequired: ['Hardware Setup', 'OS Installation', 'Wi-Fi Configuration', 'Digital Literacy'],
        eligibility: 'IT, CS students or hobbyists who know basic PC setup',
        startDate: '2026-12-08',
        endDate: '2026-12-08',
        deadline: '2026-12-06',
        availablePositions: 3,
        contactInfo: 'robert.martinez@gmail.com',
        organizer: robert._id,
        status: 'Open',
        isAssistanceRequest: true,
        assistanceDetails: {
          urgency: 'Medium',
          requesterType: 'Individual Resident',
          preferredDate: '2026-12-08',
          preferredTime: '2:00 PM - 5:00 PM',
          beneficiaryGroup: 'Adult ESL Learners',
          adminApproved: true
        }
      }
    ];

    const opportunities = [];
    for (const op of opportunitiesData) {
      const createdOp = await Opportunity.create(op);
      opportunities.push(createdOp);

      if (createdOp.isAssistanceRequest) {
        await AssistanceRequest.create({
          opportunity: createdOp._id,
          title: createdOp.title,
          description: createdOp.description,
          category: createdOp.category,
          requester: createdOp.organizer,
          requesterType: createdOp.assistanceDetails.requesterType,
          generalLocation: createdOp.location,
          requiredSkills: createdOp.skillsRequired,
          volunteersNeeded: createdOp.availablePositions,
          preferredDate: createdOp.startDate,
          preferredTime: createdOp.assistanceDetails.preferredTime,
          urgency: createdOp.assistanceDetails.urgency,
          contactMethod: 'LinkUp In-App Messaging',
          status: 'Approved'
        });
      }
    }

    // 4. Create Collaborative Projects
    const projectsData = [
      {
        title: 'Smart Waste Sorting Vision Model',
        description: 'Building an edge AI model using MobileNet and React Native to assist community clean-up volunteers in instantly classifying municipal recyclables and compost.',
        category: 'Environment and Sustainability',
        requiredSkills: ['Computer Vision', 'React Native', 'TensorFlow', 'Python'],
        teamSize: 4,
        duration: '3 months',
        owner: sarah._id,
        githubUrl: 'https://github.com/linkup-projects/smart-waste-vision',
        status: 'Active',
        members: [
          { user: sarah._id, role: 'Project Lead', joinedAt: new Date() },
          { user: marcus._id, role: 'Product Advisor', joinedAt: new Date() }
        ],
        joinRequests: []
      },
      {
        title: 'ElderCare Companion Voice Assistant',
        description: 'An open-source, private-by-default voice reminder assistant tailored for non-tech-savvy seniors to track medication schedules and emergency contacts.',
        category: 'Technology and Digital Awareness',
        requiredSkills: ['Python', 'Speech Recognition', 'FastAPI', 'UI/UX Design'],
        teamSize: 5,
        duration: '4 months',
        owner: priya._id,
        githubUrl: 'https://github.com/linkup-projects/eldercare-voice',
        status: 'Active',
        members: [
          { user: priya._id, role: 'Lead Architect', joinedAt: new Date() },
          { user: robert._id, role: 'Community Representative', joinedAt: new Date() }
        ],
        joinRequests: []
      },
      {
        title: 'Civic Scholar: Open Educational Resources Indexer',
        description: 'Collaborative curation tool designed to aggregate and verify open-access textbook chapters and academic research papers across eight core educational domains.',
        category: 'Academics and Research',
        requiredSkills: ['Node.js', 'React', 'MongoDB', 'REST APIs'],
        teamSize: 3,
        duration: '2 months',
        owner: elena._id,
        githubUrl: 'https://github.com/linkup-projects/civic-scholar',
        status: 'Active',
        members: [
          { user: elena._id, role: 'Research Lead', joinedAt: new Date() }
        ],
        joinRequests: []
      }
    ];

    for (const p of projectsData) {
      await Project.create(p);
    }

    // 5. Create Communities
    const communitiesData = [
      {
        name: 'AI & Data Science for Social Good',
        description: 'Connecting researchers, students, and civic groups applying machine learning and open data to climate, health, and education challenges.',
        category: 'Academics and Research',
        icon: 'Cpu',
        creator: elena._id,
        membersCount: 42,
        rules: [
          'Share open-access, ethical AI research only.',
          'Focus on collaborative reproducibility.',
          'Respect diverse learning levels.'
        ]
      },
      {
        name: 'Digital Literacy & Elder Care Volunteers',
        description: 'Grassroots community network dedicated to bridging technological gaps for seniors, immigrants, and underserved residents.',
        category: 'Technology and Digital Awareness',
        icon: 'Smartphone',
        creator: robert._id,
        membersCount: 38,
        rules: [
          'Patience and kindness first in all discussions.',
          'Share simple, non-jargon educational cheat-sheets.',
          'Coordinate local volunteer dates constructively.'
        ]
      },
      {
        name: 'Student Startup & Co-Founder Exchange',
        description: 'An entrepreneurial forum for university students and technical founders exploring early-stage ideas, MVP design, and finding teammates.',
        category: 'Entrepreneurship and Startups',
        icon: 'Rocket',
        creator: marcus._id,
        membersCount: 56,
        rules: [
          'No aggressive sales pitches or spam.',
          'Constructive feedback on pitch decks and MVPs.',
          'Celebrate peer achievements and lessons learned.'
        ]
      },
      {
        name: 'Urban Sustainability & Eco-Action Guild',
        description: 'Community members, environmental scientists, and volunteers coordinating tree plantings, waste audits, and sustainable civic initiatives.',
        category: 'Environment and Sustainability',
        icon: 'Leaf',
        creator: david._id,
        membersCount: 65,
        rules: [
          'Focus on tangible local ecological actions.',
          'Promote scientifically grounded sustainability solutions.',
          'Safety first during field volunteering.'
        ]
      }
    ];

    for (const c of communitiesData) {
      const comm = await Community.create(c);

      // Add sample posts
      await CommunityPost.create({
        community: comm._id,
        author: comm.creator,
        title: `Welcome to the ${comm.name} Community!`,
        content: `We are thrilled to welcome students, mentors, residents, and organizations to this collaborative space. Introduce yourself in the comments below with your current projects and what you are eager to learn or contribute!`,
        category: comm.category,
        tags: ['Welcome', 'Introduction', 'Community'],
        likes: [admin._id, sarah._id],
        comments: [
          {
            author: sarah._id,
            content: 'Excited to be here! Looking forward to collaborating on student projects and open research.',
            createdAt: new Date()
          }
        ],
        isAnnouncement: true
      });
    }

    // 6. Create Knowledge Centre Resources across approved fields
    const resourcesData = [
      {
        title: 'A Student Guide to Undergraduate Research & Paper Publications',
        description: 'Step-by-step guidance on identifying research questions, conducting systematic literature reviews, finding faculty sponsors, and submitting to student conferences.',
        category: 'Academics and Research',
        author: elena._id,
        url: 'https://metro-edu.ac/research-handbook',
        type: 'Guide',
        tags: ['Research', 'Academia', 'Literature Review', 'Student Guide'],
        upvotes: [sarah._id, priya._id, admin._id]
      },
      {
        title: 'Senior Citizen Digital Onboarding: Practical Workshop Facilitator Kit',
        description: 'A modular, high-contrast slide deck and visual reference sheet designed to guide volunteers through teaching smartphone touch gestures, app stores, and scam avoidance.',
        category: 'Technology and Digital Awareness',
        author: robert._id,
        url: 'https://silvertech-inclusion.org/toolkit',
        type: 'Guide',
        tags: ['Digital Literacy', 'Senior Citizens', 'Volunteer Toolkit', 'Smartphone'],
        upvotes: [david._id, sarah._id]
      },
      {
        title: 'Technical Resume & System Design Interview Preparation Roadmap',
        description: 'Curated strategies for structuring impactful bullet points with metric outcomes, navigating LeetCode patterns efficiently, and mastering architectural trade-off questions.',
        category: 'Career and Professional Development',
        author: priya._id,
        url: 'https://techlead.io/interview-roadmap',
        type: 'Article',
        tags: ['Career Guidance', 'System Design', 'Resume Tips', 'Software Engineering'],
        upvotes: [sarah._id, marcus._id, admin._id]
      },
      {
        title: 'Community Micro-Forestry Handbook: Native Species and Soil Prep',
        description: 'A practical urban ecology guide explaining the Miyawaki forest technique, identifying indigenous flora, and organizing municipal neighborhood planting permits.',
        category: 'Environment and Sustainability',
        author: marcus._id,
        url: 'https://greenwaveinnovations.io/handbook',
        type: 'Whitepaper / Report',
        tags: ['Environment', 'Micro Forest', 'Urban Ecology', 'Tree Planting'],
        upvotes: [david._id, maya._id]
      },
      {
        title: 'Digital Payments Safety for Micro-Merchants and Local Vendors',
        description: 'Essential security guidelines covering QR code spoofing prevention, two-factor authentication on merchant wallets, and protecting customer payment confidentiality.',
        category: 'Financial and Digital Awareness',
        author: david._id,
        url: 'https://civicreach.org/finlit-security',
        type: 'Article',
        tags: ['Financial Literacy', 'Digital Payments', 'Cyber Safety', 'Small Business'],
        upvotes: [robert._id, admin._id]
      },
      {
        title: 'Community Well-being & Stress Management for University Students',
        description: 'Evidence-based mindfulness techniques, sleep hygiene strategies, and campus peer-support resources to prevent burnout during exam periods and thesis writing.',
        category: 'Health and Well-being',
        author: maya._id,
        url: 'https://communityroots.org/student-wellness',
        type: 'Guide',
        tags: ['Mental Health', 'Student Well-being', 'Wellness', 'Preventive Health'],
        upvotes: [sarah._id, elena._id, admin._id]
      }
    ];

    for (const r of resourcesData) {
      await Resource.create(r);
    }

    // 7. Add sample initial notification
    await Notification.create({
      recipient: sarah._id,
      sender: admin._id,
      type: 'system',
      title: 'Welcome to LinkUp!',
      message: 'Explore open academic projects, volunteer opportunities, and connect with fellow students and community leaders.',
      link: '/explore'
    });

    console.log('[Seed] Database successfully seeded with 8 users, 4 organizations, 9 opportunities, 3 collaborative projects, 4 communities, and 6 knowledge resources!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
};
