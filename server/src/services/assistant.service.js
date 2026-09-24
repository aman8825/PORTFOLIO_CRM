const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Achievement = require('../models/Achievement');
const PortfolioKnowledge = require('../models/PortfolioKnowledge');
const AssistantQuestion = require('../models/AssistantQuestion');

// Stop words to remove during keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 
  'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 
  'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'what', 'who', 'how', 
  'when', 'where', 'which', 'do', 'does', 'did', 'has', 'have', 'had', 'can', 'could', 
  'would', 'should', 'tell', 'me', 'about', 'aman', 'amans'
]);

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ') // normalize spaces
    .trim();
}

function extractKeywords(text) {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  return words.filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function calculateScore(userWords, targetWords) {
  if (userWords.length === 0 || targetWords.length === 0) return 0;
  let matches = 0;
  for (const uw of userWords) {
    for (const tw of targetWords) {
      if (uw === tw || uw.includes(tw) || tw.includes(uw)) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.max(userWords.length, targetWords.length);
}

/**
 * Extracts relevant dynamic portfolio information based on intent keywords.
 */
async function searchPortfolioData(keywords) {
  const keywordStr = keywords.join(' ');
  
  // Projects Intent
  if (keywordStr.includes('project') || keywordStr.includes('built') || keywordStr.includes('create') || keywordStr.includes('develop')) {
    const projects = await Project.find().sort('-createdAt').limit(5);
    if (projects.length > 0) {
      const pList = projects.map(p => `- ${p.title}: ${p.technologies.join(', ')}`).join('\n');
      return `Aman has built several projects including:\n${pList}.`;
    }
  }

  // Skills Intent
  if (keywordStr.includes('skill') || keywordStr.includes('tech') || keywordStr.includes('stack') || keywordStr.includes('backend') || keywordStr.includes('frontend')) {
    const skills = await Skill.find().sort('order');
    if (skills.length > 0) {
      const sList = skills.map(s => s.name).join(', ');
      return `Aman's technical skills include: ${sList}.`;
    }
  }

  // Experience Intent
  if (keywordStr.includes('experience') || keywordStr.includes('work') || keywordStr.includes('freelance') || keywordStr.includes('job')) {
    const exp = await Experience.find().sort('-startDate');
    if (exp.length > 0) {
      const eList = exp.map(e => `- ${e.title} at ${e.company}`).join('\n');
      return `Aman's experience includes:\n${eList}.`;
    }
  }

  // Certifications / Achievements Intent
  if (keywordStr.includes('certificat') || keywordStr.includes('achieve') || keywordStr.includes('award') || keywordStr.includes('nptel')) {
    const achievements = await Achievement.find().sort('-date');
    if (achievements.length > 0) {
      const aList = achievements.map(a => `- ${a.title} by ${a.issuer}`).join('\n');
      return `Aman's certifications and achievements include:\n${aList}.`;
    }
  }

  // Profile / General
  if (keywordStr.includes('contact') || keywordStr.includes('email') || keywordStr.includes('hire') || keywordStr.includes('available')) {
    const profile = await Profile.findOne();
    if (profile) {
      return `You can contact Aman at ${profile.email}. ${profile.location ? `He is located in ${profile.location}.` : ''}`;
    }
  }

  return null;
}

exports.askQuestion = async (userQuestion) => {
  try {
    const normalizedQ = normalizeText(userQuestion);
    const userKeywords = extractKeywords(userQuestion);
    
    // 1. Search PortfolioKnowledge (Approved entries)
    const knowledgeBase = await PortfolioKnowledge.find({ approved: true });
    
    let bestMatch = null;
    let highestScore = 0;

    for (const entry of knowledgeBase) {
      const normKnowledgeQ = normalizeText(entry.question);
      
      // Exact Question Match
      if (normKnowledgeQ === normalizedQ) {
        bestMatch = entry.answer;
        highestScore = 1;
        break;
      }

      // Alias Match
      if (entry.aliases && entry.aliases.length > 0) {
        for (const alias of entry.aliases) {
          if (normalizeText(alias) === normalizedQ) {
            bestMatch = entry.answer;
            highestScore = 1;
            break;
          }
        }
      }
      if (highestScore === 1) break;

      // Keyword / Intent Score Match
      const entryKeywords = extractKeywords(entry.question);
      const combinedTarget = [...entryKeywords, ...(entry.keywords || [])];
      
      const score = calculateScore(userKeywords, combinedTarget);
      if (score > highestScore && score >= 0.5) { // Threshold for keyword match
        highestScore = score;
        bestMatch = entry.answer;
      }
    }

    if (bestMatch && highestScore >= 0.5) {
      return {
        success: true,
        answered: true,
        answer: bestMatch,
        source: 'knowledge'
      };
    }

    // 2. Search Dynamic Portfolio Data
    if (userKeywords.length > 0) {
      const dynamicAnswer = await searchPortfolioData(userKeywords);
      if (dynamicAnswer) {
        return {
          success: true,
          answered: true,
          answer: dynamicAnswer,
          source: 'portfolio'
        };
      }
    }

    // 3. Unknown Question Fallback
    const fallbackAnswer = "I don’t have verified information about that yet. I’ve sent your question to Aman for review.";
    
    // Deduplicate in DB
    let pendingQuestion = await AssistantQuestion.findOne({ 
      normalizedQuestion: normalizedQ,
      status: { $ne: 'answered' }
    });

    if (pendingQuestion) {
      pendingQuestion.askedCount += 1;
      await pendingQuestion.save();
    } else {
      pendingQuestion = await AssistantQuestion.create({
        question: userQuestion,
        normalizedQuestion: normalizedQ
      });
    }

    return {
      success: true,
      answered: false,
      answer: fallbackAnswer,
      questionId: pendingQuestion._id
    };

  } catch (error) {
    console.error('Portfolio Matcher Error:', error);
    return {
      success: true,
      answered: false,
      answer: "I’m having trouble answering right now. Please try again or contact Aman directly."
    };
  }
};
