const express = require('express');
const router = express.Router();
const { getArticles, getArticle, getArticleBySlug, createArticle, updateArticle, deleteArticle } = require('../../controllers/articlesController');
const { protect } = require('../../middleware/auth');

router.route('/')
  .get(getArticles)
  .post(protect, createArticle);

router.route('/slug/:slug')
  .get(getArticleBySlug);

router.route('/:id')
  .get(getArticle)
  .put(protect, updateArticle)
  .delete(protect, deleteArticle);

module.exports = router;
