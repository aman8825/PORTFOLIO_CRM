require('dotenv').config();
const mongoose = require('mongoose');

const Project = require('../src/models/Project');
const Skill = require('../src/models/Skill');
const Experience = require('../src/models/Experience');
const Achievement = require('../src/models/Achievement');

const PROJECTS_DATA = [
  {
    title: "Cravings",
    category: "Full-Stack Platform",
    slug: "cravings",
    thumbnailImage: { url: "/projects/cravings.png" },
    shortDescription: "A comprehensive food ordering platform engineered with a robust MERN stack architecture, featuring specialized workflows for customers, restaurants, and administrators.",
    detailedDescription: "A comprehensive food ordering platform engineered with a robust MERN stack architecture, featuring specialized workflows for customers, restaurants, and administrators.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "JWT", "Tailwind CSS"],
    features: [
      "Restaurant discovery and menu browsing",
      "Cart management and secure checkout process",
      "Real-time order processing pipeline",
      "Role-based authorization mapping",
      "Custom REST API architecture"
    ],
    githubUrl: "https://github.com",
    liveDemoUrl: "#",
    order: 1,
    published: true
  },
  {
    title: "ApplyPilot",
    category: "Automation Software",
    slug: "applypilot",
    thumbnailImage: { url: "/projects/applypilot.png" },
    shortDescription: "An intelligent HR email automation platform that streamlines recruiting workflows by extracting data from PDF documents and automating personalized outreach.",
    detailedDescription: "An intelligent HR email automation platform that streamlines recruiting workflows by extracting data from PDF documents and automating personalized outreach.",
    technologies: ["React.js", "Node.js", "Express.js", "Nodemailer", "Multer"],
    features: [
      "PDF data extraction and structured JSON conversion",
      "Automated and scheduled email delivery",
      "File upload validation and duplicate detection",
      "Recruiter outreach tracking and delivery status",
      "Visual workflow progression system"
    ],
    githubUrl: "https://github.com",
    liveDemoUrl: "#",
    order: 2,
    published: true
  },
  {
    title: "Bihar Spine & Neuro",
    category: "Production Website",
    slug: "bihar-spine-neuro",
    thumbnailImage: { url: "/projects/spine-neuro.png" },
    shortDescription: "A dynamic, responsive healthcare platform tailored for a real-world clinic, focusing on patient accessibility, appointment management, and content delivery.",
    detailedDescription: "A dynamic, responsive healthcare platform tailored for a real-world clinic, focusing on patient accessibility, appointment management, and content delivery.",
    technologies: ["React.js", "Firebase", "JavaScript", "HTML5", "CSS3"],
    features: [
      "Responsive patient-facing interface",
      "Firebase-powered administrative dashboard",
      "Real-time appointment enquiry system",
      "Patient feedback collection mechanism",
      "Promotional content management system"
    ],
    githubUrl: "",
    liveDemoUrl: "#",
    order: 3,
    published: true
  }
];

const SKILL_CATEGORIES = [
  {
    title: "Frontend",
    skills: ["React.js", "JavaScript ES6+", "Tailwind CSS"]
  },
  {
    title: "Backend",
    skills: ["Node.js", "Express.js"]
  },
  {
    title: "Database",
    skills: ["MongoDB", "Mongoose", "MySQL", "Firebase"]
  },
  {
    title: "Authentication & APIs",
    skills: ["REST APIs", "JWT Authentication", "Authorization", "Middleware", "API Integration"]
  },
  {
    title: "Tools & Utilities",
    skills: ["Git", "GitHub", "Postman", "Nodemailer", "Multer", "PDF Processing"] // 'Tools & Utilities' needs mapping to 'Tools' for ENUM
  }
];

const EXPERIENCE_DATA = [
  {
    company: "Bihar Spine & Neuro Physio Care",
    role: "Freelance Full-Stack Developer",
    startDate: "2026",
    endDate: "",
    description: "I took complete ownership of building the digital presence for Bihar Spine & Neuro Physio Care. Instead of just delivering code, I delivered a complete solution tailored to real healthcare operational workflows. The architecture was designed to handle secure patient interactions and enable clinic staff to manage content dynamically via a Firebase-powered administration layer.",
    technologies: ["React.js", "JavaScript", "Firebase", "HTML5", "CSS3"],
    order: 1
  }
];

const ACHIEVEMENTS_DATA = [
  {
    title: "Programming in Java",
    issuer: "NPTEL — IIT Kharagpur",
    date: "Jan–Apr 2026",
    badge: "Elite Certificate with Gold Badge",
    score: "91%",
    description: "Successfully completed and mastered advanced Java programming concepts, data structures, and algorithms, achieving top-tier recognition.",
    certificateImage: { url: "/certificates/nptel-java-certificate.jpg" },
    order: 1
  },
  {
    title: "Coding Premier League (CPL) Season 1",
    issuer: "CPL 2026",
    date: "2026",
    badge: "Selected Participant",
    description: "Recognized for technical excellence and selected to present a comprehensive, production-ready full-stack software project among top competitors.",
    certificateImage: { url: "/certificates/cpl-certificate.jpg" },
    order: 2
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed Projects
    for (const proj of PROJECTS_DATA) {
      const exists = await Project.findOne({ slug: proj.slug });
      if (!exists) {
        await Project.create(proj);
        console.log(`Created project: ${proj.title}`);
      } else {
        console.log(`Project already exists: ${proj.title}`);
      }
    }

    // Seed Skills
    let skillOrder = 1;
    for (const cat of SKILL_CATEGORIES) {
      const enumCategory = cat.title === "Tools & Utilities" ? "Tools" : cat.title;
      for (const skillName of cat.skills) {
        const exists = await Skill.findOne({ name: skillName, category: enumCategory });
        if (!exists) {
          await Skill.create({
            name: skillName,
            category: enumCategory,
            order: skillOrder,
            enabled: true
          });
          console.log(`Created skill: ${skillName}`);
        } else {
          console.log(`Skill already exists: ${skillName}`);
        }
        skillOrder++;
      }
    }

    // Seed Experience
    for (const exp of EXPERIENCE_DATA) {
      const exists = await Experience.findOne({ company: exp.company, role: exp.role });
      if (!exists) {
        await Experience.create(exp);
        console.log(`Created experience: ${exp.company}`);
      } else {
        console.log(`Experience already exists: ${exp.company}`);
      }
    }

    // Seed Achievements
    for (const ach of ACHIEVEMENTS_DATA) {
      const exists = await Achievement.findOne({ title: ach.title });
      if (!exists) {
        await Achievement.create(ach);
        console.log(`Created achievement: ${ach.title}`);
      } else {
        console.log(`Achievement already exists: ${ach.title}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
