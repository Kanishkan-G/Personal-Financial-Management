package com.finance.backend.repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import com.finance.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCategoryIgnoreCase(String category);
    List<Transaction> findByDateBetween(LocalDate start, LocalDate end);
    List<Transaction> findByCategoryIgnoreCaseAndDateBetween(String category, LocalDate start, LocalDate end);
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type")
    Double getTotalAmountByType(@Param("type") String type);

}