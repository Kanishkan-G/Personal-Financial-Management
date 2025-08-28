package com.finance.backend.repository;

import com.finance.backend.model.BankStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface BankStatementRepository extends JpaRepository<BankStatement, Long> {

    @Query("SELECT COALESCE(SUM(b.amount),0) FROM BankStatement b WHERE b.amount < 0 AND b.date BETWEEN :start AND :end")
    Double getTotalExpenseBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(b.amount),0) FROM BankStatement b WHERE b.amount > 0 AND b.date BETWEEN :start AND :end")
    Double getTotalIncomeBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
}