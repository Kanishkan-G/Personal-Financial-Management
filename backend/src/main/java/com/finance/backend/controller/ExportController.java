package com.finance.backend.controller;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "http://localhost:3000")
public class ExportController {

    @PostMapping(value = "/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> exportPdf(@RequestPart("image") MultipartFile image,
                                            @RequestParam(value = "filename", required = false) String filename) throws Exception {
        byte[] bytes = image.getBytes();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf, PageSize.A4);

        ImageData imageData = ImageDataFactory.create(bytes);
        Image img = new Image(imageData);
        img.setAutoScale(true);
        doc.add(img);
        doc.close();

        byte[] pdfBytes = baos.toByteArray();
        String outName = (filename == null || filename.isBlank()) ? "dashboard.pdf" : filename;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + outName)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}


