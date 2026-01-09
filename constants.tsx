
import React from 'react';
import { Category, Transaction, UserProfile, SavingsGoal, Budget } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', color: '#ef4444', icon: 'fa-utensils' },
  { id: '2', name: 'Transport', color: '#3b82f6', icon: 'fa-car' },
  { id: '3', name: 'Shopping', color: '#8b5cf6', icon: 'fa-bag-shopping' },
  { id: '4', name: 'Income', color: '#10b981', icon: 'fa-money-bill-trend-up' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: new Date().toISOString(), amount: 1200, category: 'Income', description: 'Monthly Salary', type: 'income' },
  { id: 't2', date: new Date().toISOString(), amount: 45.5, category: 'Food', description: 'Grocery shopping', type: 'expense' },
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  avatar: 'https://picsum.photos/seed/alex/200',
  currency: 'USD',
};

export const INITIAL_GOALS: SavingsGoal[] = [
  { id: 'g1', name: 'New Car', targetAmount: 25000, currentAmount: 5000, deadline: '2025-12-31' },
];

export const INITIAL_BUDGETS: Budget[] = [
  { categoryId: '1', limit: 500, spent: 45.5 },
];
