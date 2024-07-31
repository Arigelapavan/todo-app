const express = require('express');
const ToDo = require('../models/ToDo');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

router.post('/', authenticate, async (req, res) => {
  try {
    const { task } = req.body;
    const todo = new ToDo({
      userId: req.userId,
      task
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const todos = await ToDo.find({ userId: req.userId });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { task, completed } = req.body;
    const todo = await ToDo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { task, completed },
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ message: 'To-Do item not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const todo = await ToDo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!todo) {
      return res.status(404).json({ message: 'To-Do item not found' });
    }
    res.json({ message: 'To-Do item deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;