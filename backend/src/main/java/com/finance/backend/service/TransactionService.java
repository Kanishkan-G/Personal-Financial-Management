package com.finance.backend.service;

import com.finance.backend.model.Transaction;
import com.finance.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public List<Transaction> getAllTransactions() {
        return repository.findAll();
    }

    public Transaction saveTransaction(Transaction transaction) {
        return repository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        return repository.findById(id).map(transaction -> {
            transaction.setCategory(updatedTransaction.getCategory());
            transaction.setType(updatedTransaction.getType());
            transaction.setAmount(updatedTransaction.getAmount());
            transaction.setDate(updatedTransaction.getDate());
            return repository.save(transaction);
        }).orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
    }
    public void deleteTransaction(Long id) {
        repository.deleteById(id);
    }
    public List<Transaction> getFilteredTransactions(String category, LocalDate startDate, LocalDate endDate) {
        if (category != null && startDate != null && endDate != null) {
            return repository.findByCategoryIgnoreCaseAndDateBetween(category, startDate, endDate);
        } else if (category != null) {
            return repository.findByCategoryIgnoreCase(category);
        } else if (startDate != null && endDate != null) {
            return repository.findByDateBetween(startDate, endDate);
        } else {
            return repository.findAll();
        }
    }
    public Double getTotalAmountByType(String type) {
        return repository.getTotalAmountByType(type);
    }

    public Double getBalance() {
        Double income = getTotalAmountByType("Income");
        Double expense = getTotalAmountByType("Expense");
        return income - expense;
    }
}