package com.finance.backend.controller;

import com.finance.backend.model.BankStatement;
import com.finance.backend.service.BankStatementService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/bankstatements")
@CrossOrigin(origins = "http://localhost:3000")
public class BankStatementController {
    private final BankStatementService service;

    public BankStatementController(BankStatementService service) {
        this.service = service;
    }

    @PostMapping("/upload")
    public Map<String, String> uploadCSV(@RequestParam("file") MultipartFile file) {
        try {
            service.saveCSV(file);
            // After upload, compute suggestions for the uploaded month using current month as reference
            YearMonth currentMonth = YearMonth.now();
            return service.getSuggestionsForMonth(currentMonth);
        } catch (Exception e) {
            return Map.of("error", "CSV upload failed: " + e.getMessage());
        }
    }

    @GetMapping
    public List<BankStatement> getAllStatements() {
        return service.getAllStatements();
    }

    @DeleteMapping("/{id}")
    public void deleteStatement(@PathVariable Long id) {
        service.deleteStatement(id);
    }

    // New: Suggestions endpoint
    @GetMapping("/suggestions")
    public Map<String, String> getMonthlySuggestions() {
        return service.getMonthlySuggestions();
    }
}