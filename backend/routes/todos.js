const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const Todo = require('../models/Todo')
const { protect } = require('../middleware/auth')

// All routes are protected
router.use(protect)

// GET /api/todos
router.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(todos)
  } catch (err) {
    next(err)
  }
})

// POST /api/todos
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const todo = await Todo.create({
        user: req.user._id,
        title: req.body.title,
      })
      res.status(201).json(todo)
    } catch (err) {
      next(err)
    }
  }
)

// PATCH /api/todos/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id })
    if (!todo) return res.status(404).json({ message: 'Todo not found.' })

    const { title, completed } = req.body
    if (title !== undefined) todo.title = title.trim()
    if (completed !== undefined) todo.completed = completed

    await todo.save()
    res.json(todo)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/todos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!todo) return res.status(404).json({ message: 'Todo not found.' })
    res.json({ message: 'Todo deleted.' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
