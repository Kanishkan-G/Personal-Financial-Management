package com.finance.backend.service;

import com.finance.backend.model.BankStatement;
import com.finance.backend.repository.BankStatementRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BankStatementService {
    private final BankStatementRepository repository;

    public BankStatementService(BankStatementRepository repository) {
        this.repository = repository;
    }

    public void saveCSV(MultipartFile file) throws Exception {
        List<BankStatement> entries = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord record : csvParser) {
                BankStatement entry = new BankStatement();
                entry.setDate(LocalDate.parse(record.get("Date")));
                entry.setDescription(record.get("Description"));
                entry.setAmount(Double.parseDouble(record.get("Amount")));
                entry.setCategory(record.get("Category"));
                entries.add(entry);
            }
        }
        repository.saveAll(entries);
    }

    public List<BankStatement> getAllStatements() {
        return repository.findAll();
    }

    public void deleteStatement(Long id) {
        repository.deleteById(id);
    }

    // New: Generate suggestions comparing this month vs previous month with scaled and formatted percentages
    public Map<String, String> getMonthlySuggestions() {
        YearMonth now = YearMonth.now();
        YearMonth lastMonth = now.minusMonths(1);

        LocalDate thisMonthStart = now.atDay(1);
        LocalDate thisMonthEnd = now.atEndOfMonth();
        LocalDate lastMonthStart = lastMonth.atDay(1);
        LocalDate lastMonthEnd = lastMonth.atEndOfMonth();

        Double thisMonthExpense = Math.abs(repository.getTotalExpenseBetween(thisMonthStart, thisMonthEnd));
        Double thisMonthIncome = repository.getTotalIncomeBetween(thisMonthStart, thisMonthEnd);
        Double lastMonthExpense = Math.abs(repository.getTotalExpenseBetween(lastMonthStart, lastMonthEnd));
        Double lastMonthIncome = repository.getTotalIncomeBetween(lastMonthStart, lastMonthEnd);

        String expenseMsg, incomeMsg;

        // Expense advice with percentage scaled by dividing by 10
        if (lastMonthExpense > 0) {
            double expenseChange = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
            double scaledExpenseChange = expenseChange / 10.0;
            String formattedExpenseChange = String.format("%.2f", scaledExpenseChange);
            if (scaledExpenseChange > 20) {
                expenseMsg = String.format("Your expense is %s%% higher than last month. Try to lower your expense.", formattedExpenseChange);
            } else if (scaledExpenseChange < -20) {
                expenseMsg = String.format("Great! Your expense is %s%% lower than last month.", formattedExpenseChange.replace("-", ""));
            } else {
                expenseMsg = "Your expense is similar to last month.";
            }
        } else {
            expenseMsg = "No expenses found for last month for comparison.";
        }

        // Income advice with percentage scaled by dividing by 10
        if (lastMonthIncome > 0) {
            double incomeChange = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
            double scaledIncomeChange = incomeChange / 10.0;
            String formattedIncomeChange = String.format("%.2f", scaledIncomeChange);
            if (scaledIncomeChange > 20) {
                incomeMsg = String.format("Your income is %s%% higher than last month. Keep it up.", formattedIncomeChange);
            } else if (scaledIncomeChange < -20) {
                incomeMsg = String.format("Your income is %s%% lower than last month.", formattedIncomeChange.replace("-", ""));
            } else {
                incomeMsg = "Your income is similar to last month.";
            }
        } else {
            incomeMsg = "No income found for last month for comparison.";
        }

        Map<String, String> result = new HashMap<>();
        result.put("expenseSuggestion", expenseMsg);
        result.put("incomeSuggestion", incomeMsg);

        return result;
    }
}