const express = require('express');
const router = express.Router();
const { addExpense, getGroupExpenses, deleteExpense, getUserExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addExpense);
router.get('/user', protect, getUserExpenses);
router.delete('/:id', protect, deleteExpense);
// Note: The prompt specified GET /api/groups/:id/expenses but logically it might be under /expenses route or /groups route.
// The prompt listed: "GET /api/groups/:id/expenses". 
// I'll put it here but I need to handle the routing correctly in server.js or groupRoutes.
// Actually, it's cleaner to have it in groupRoutes if the URL is /api/groups/:id/expenses.
// But I can also mount this router at /api/expenses and handle it differently.
// Let's follow the prompt's URL structure strictly.
// If the prompt says GET /api/groups/:id/expenses, I should probably add it to groupRoutes or handle it there.
// However, I made expenseController which has getGroupExpenses.
// I will export these and use them where appropriate.
// For now, I'll put 'add' here.
// I'll add 'getGroupExpenses' to groupRoutes.js logic or re-export.
// Wait, for clarity, I'll keep them in their respective domain files but mount them carefully.
// I will modify groupRoutes to include the expenses route.

module.exports = router;
