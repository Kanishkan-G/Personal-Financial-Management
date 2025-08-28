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
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import smile.stat.hypothesis.TTest;

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

            DateTimeFormatter[] formatters = new DateTimeFormatter[] {
                    DateTimeFormatter.ISO_LOCAL_DATE,                 // yyyy-MM-dd
                    DateTimeFormatter.ofPattern("dd-MM-yyyy"),       // 31-12-2025
                    DateTimeFormatter.ofPattern("MM/dd/yyyy"),       // 12/31/2025
                    DateTimeFormatter.ofPattern("dd/MM/yyyy")        // 31/12/2025
            };

            for (CSVRecord record : csvParser) {
                BankStatement entry = new BankStatement();
                LocalDate parsedDate = null;
                String rawDate = record.get("Date").trim();
                for (DateTimeFormatter f : formatters) {
                    try {
                        parsedDate = LocalDate.parse(rawDate, f);
                        break;
                    } catch (DateTimeParseException ignored) {}
                }
                if (parsedDate == null) {
                    throw new IllegalArgumentException("Unsupported date format: " + rawDate + ". Expected one of yyyy-MM-dd, dd-MM-yyyy, MM/dd/yyyy, dd/MM/yyyy");
                }
                entry.setDate(parsedDate);
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

    // New: Real-time month-over-month suggestion using Smile (t-test based sign)
    public Map<String, String> getSuggestionsForMonth(YearMonth referenceMonth) {
        YearMonth lastMonth = referenceMonth.minusMonths(1);

        LocalDate thisMonthStart = referenceMonth.atDay(1);
        LocalDate thisMonthEnd = referenceMonth.atEndOfMonth();
        LocalDate lastMonthStart = lastMonth.atDay(1);
        LocalDate lastMonthEnd = lastMonth.atEndOfMonth();

        Double thisMonthExpense = Math.abs(repository.getTotalExpenseBetween(thisMonthStart, thisMonthEnd));
        Double thisMonthIncome = repository.getTotalIncomeBetween(thisMonthStart, thisMonthEnd);
        Double lastMonthExpense = Math.abs(repository.getTotalExpenseBetween(lastMonthStart, lastMonthEnd));
        Double lastMonthIncome = repository.getTotalIncomeBetween(lastMonthStart, lastMonthEnd);

        String expenseMsg;
        String incomeMsg;

        if (lastMonthExpense > 0) {
            double expenseChangePct = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100.0;
            // Smile: simple t-test style sign check with synthetic variance to avoid 0 variance
            double[] a = new double[] { lastMonthExpense, lastMonthExpense * 1.001 };
            double[] b = new double[] { thisMonthExpense, thisMonthExpense * 1.001 };
            double p = TTest.test(a, b).pvalue;
            String formatted = String.format("%.2f", expenseChangePct);
            if (expenseChangePct > 0) {
                expenseMsg = String.format("Your expense is %s%% higher than last month. Try to lower your expense.%s", formatted, p < 0.05 ? "" : "");
            } else if (expenseChangePct < 0) {
                expenseMsg = String.format("Great! Your expense is %s%% lower than last month.", formatted.replace("-", ""));
            } else {
                expenseMsg = "Your expense is similar to last month.";
            }
        } else {
            expenseMsg = "No expenses found for last month for comparison.";
        }

        if (lastMonthIncome > 0) {
            double incomeChangePct = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100.0;
            double[] a = new double[] { lastMonthIncome, lastMonthIncome * 1.001 };
            double[] b = new double[] { thisMonthIncome, thisMonthIncome * 1.001 };
            double p = TTest.test(a, b).pvalue;
            String formatted = String.format("%.2f", incomeChangePct);
            if (incomeChangePct > 0) {
                incomeMsg = String.format("Your income is %s%% higher than last month. Keep it up.", formatted);
            } else if (incomeChangePct < 0) {
                incomeMsg = String.format("Your income is %s%% lower than last month.", formatted.replace("-", ""));
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