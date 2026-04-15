package com.nt.service;

import com.nt.entity.UploadedFile;
import com.nt.repository.FileRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FileService {
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);
    private final String uploadDir = "uploads/";

    @Autowired
    public FileRepository fileRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<UploadedFile> saveFiles(MultipartFile[] files, String uploadedBy) throws IOException {
        logger.info("Saving {} files uploaded by: {}", files.length, uploadedBy);
        List<UploadedFile> savedFiles = new ArrayList<>();

        Files.createDirectories(Paths.get(uploadDir));

        for (MultipartFile file : files) {
            String fileName = file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("File {} saved successfully", fileName);

            UploadedFile uploadedFile = new UploadedFile(
                    uploadedBy,
                    fileName,
                    file.getContentType(),
                    file.getSize()
            );
            savedFiles.add(fileRepository.save(uploadedFile));
        }
        logger.info("All files uploaded successfully");
        return savedFiles;
    }

    public ResponseEntity<String> getFileContent(Long fileId) throws IOException {
        logger.info("Fetching content for file ID: {}", fileId);
        Optional<UploadedFile> fileRecord = fileRepository.findById(fileId);

        if (fileRecord.isPresent()) {
            UploadedFile uploadedFile = fileRecord.get();
            String fileName = uploadedFile.getFileName();
            Path filePath = Paths.get(uploadDir + fileName);
            String fileType = uploadedFile.getFileType();

            if (!Files.exists(filePath)) {
                logger.warn("File {} not found in storage", uploadedFile.getFileName());
                return new ResponseEntity<>("File not found!", HttpStatus.NOT_FOUND);
            }

            String content = extractTextFromFile(filePath, fileType);

            if (content == null) {
                return new ResponseEntity<>("Unable to extract file content!", HttpStatus.BAD_REQUEST);
            }

            return new ResponseEntity<>(content, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("File record not found in database!", HttpStatus.NOT_FOUND);
        }
    }

    private String extractTextFromFile(Path filePath, String fileType) throws IOException {
        if (fileType == null) {
            logger.warn("File type is null, extraction failed");
            return null;
        }

        if (fileType.equals("text/plain")) {
            return Files.readString(filePath, StandardCharsets.UTF_8);
        } else if (fileType.equals("text/csv") || fileType.equals("application/vnd.ms-excel")) {
            return extractTextFromCSV(filePath);
          }
        else{
            return "File not supported";
        }
    }


    private String extractTextFromCSV(Path filePath) throws IOException {
        StringBuilder text = new StringBuilder();
        try (Reader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.parse(reader);
            for (CSVRecord record : records) {
                text.append(String.join(", ", record)).append("\n");
            }
        }
        return text.toString();
    }

    public ResponseEntity<String> updateFileContent(Long fileId, String newContent) throws IOException {
        Optional<UploadedFile> fileRecord = fileRepository.findById(fileId);

        if (fileRecord.isPresent()) {
            UploadedFile uploadedFile = fileRecord.get();
            String fileName = uploadedFile.getFileName();
            Path filePath = Paths.get(uploadDir + fileName);

            if (!Files.exists(filePath)) {
                logger.warn("File {} not found in storage", uploadedFile.getFileName());
                return new ResponseEntity<>("File not found!", HttpStatus.NOT_FOUND);
            }

            Files.writeString(filePath, newContent, StandardCharsets.UTF_8);
            logger.info("File content updated successfully");

            return new ResponseEntity<>("File updated successfully!", HttpStatus.OK);
        } else {
            logger.warn("File record with ID {} not found in database", fileId);
            return new ResponseEntity<>("File record not found in database!", HttpStatus.NOT_FOUND);
        }
    }

//    public Page<UploadedFile> getAllFiles(int page, int size, String sortBy, String sortDir) {
//        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
//        Pageable pageable = PageRequest.of(page, size, sort);
//        logger.info("getting all files");
//        return fileRepository.findAll(pageable);
//    }
//
//    public List<UploadedFile> getFilteredFiles(String fileName, String uploadedBy, String startDate, String endDate) {
//        StringBuilder queryStr = new StringBuilder("SELECT * FROM uploaded_files WHERE 1=1");
//
//        if (fileName != null && !fileName.isEmpty()) {
//            logger.info("Filtering on basis of file name");
//            queryStr.append(" AND LOWER(fileName) LIKE LOWER(:fileName)");
//        }
//        if (uploadedBy != null && !uploadedBy.isEmpty()) {
//            logger.info("Filtering on basis of uploadedBy");
//            queryStr.append(" AND LOWER(uploadedBy) = LOWER(:uploadedBy)");
//        }
//        if (startDate != null && endDate != null) {
//            logger.info("Filtering on basis of created date");
//            queryStr.append(" AND createdDate BETWEEN :startDate AND :endDate");
//        }
//
//        Query query = entityManager.createNativeQuery(queryStr.toString(), UploadedFile.class);
//
//        if (fileName != null && !fileName.isEmpty()) {
//            query.setParameter("fileName", "%" + fileName + "%");
//        }
//        if (uploadedBy != null && !uploadedBy.isEmpty()) {
//            query.setParameter("uploadedBy", uploadedBy.toLowerCase());
//        }
//        if (startDate != null && endDate != null) {
//            query.setParameter("startDate", LocalDateTime.parse(startDate));
//            query.setParameter("endDate", LocalDateTime.parse(endDate));
//        }
//        logger.info("getting filtered files");
//        return query.getResultList();
//    }


    public Page<UploadedFile> getFilteredFiles(String fileName, String uploadedBy,
                                               String startDate, String endDate,
                                               int page, int size, String sortBy, String sortDir) {
        StringBuilder queryStr = new StringBuilder("SELECT * FROM uploaded_files WHERE 1=1");
        StringBuilder countQueryStr = new StringBuilder("SELECT COUNT(*) FROM uploaded_files WHERE 1=1");
        Map<String, Object> parameters = new HashMap<>();

        // Add filter conditions
        if (fileName != null && !fileName.isEmpty()) {
            queryStr.append(" AND LOWER(fileName) LIKE LOWER(:fileName)");
            countQueryStr.append(" AND LOWER(fileName) LIKE LOWER(:fileName)");
            parameters.put("fileName", "%" + fileName + "%");
        }

        if (uploadedBy != null && !uploadedBy.isEmpty()) {
            queryStr.append(" AND LOWER(uploadedBy) = LOWER(:uploadedBy)");
            countQueryStr.append(" AND LOWER(uploadedBy) = LOWER(:uploadedBy)");
            parameters.put("uploadedBy", uploadedBy.toLowerCase());
        }

        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            queryStr.append(" AND DATE(createdDate) BETWEEN :startDate AND :endDate");
            countQueryStr.append(" AND DATE(createdDate) BETWEEN :startDate AND :endDate");
            try {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end = LocalDate.parse(endDate);
                parameters.put("startDate", start);
                parameters.put("endDate", end);
            } catch (Exception e) {
                logger.error("Error parsing dates", e);
            }
        }

        // Add sorting
        queryStr.append(" ORDER BY ").append(sortBy).append(" ")
                .append(sortDir.equalsIgnoreCase("desc") ? "DESC" : "ASC");

        // Add pagination
        queryStr.append(" LIMIT :pageSize OFFSET :offset");

        // Create queries
        Query query = entityManager.createNativeQuery(queryStr.toString(), UploadedFile.class);
        Query countQuery = entityManager.createNativeQuery(countQueryStr.toString());

        // Set all parameters
        parameters.forEach((key, value) -> {
            query.setParameter(key, value);
            countQuery.setParameter(key, value);
        });

        // Set pagination parameters
        query.setParameter("pageSize", size);
        query.setParameter("offset", page * size);

        // Execute queries
        List<UploadedFile> files = query.getResultList();
        Long total = ((Number) countQuery.getSingleResult()).longValue();

        // Create pageable object
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy));

        return new PageImpl<>(files, pageable, total);
    }




    public ResponseEntity<String> deleteFileById(Long id) {
        logger.info("Deleting file with ID: {}", id);
        Optional<UploadedFile> fileRecord = fileRepository.findById(id);

        if (fileRecord.isPresent()) {
            UploadedFile uploadedFile = fileRecord.get();
            String fileName = uploadedFile.getFileName();
            Path filePath = Paths.get(uploadDir + fileName);

            try {
                Files.deleteIfExists(filePath);
                logger.info("File {} deleted from storage", uploadedFile.getFileName());
            } catch (IOException e) {
                logger.error("Error deleting file {}: {}", uploadedFile.getFileName(), e.getMessage());
                return new ResponseEntity<>("Error deleting file from storage", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            fileRepository.deleteById(id);
            logger.info("File record deleted from database");

            return new ResponseEntity<>("File deleted successfully!", HttpStatus.OK);
        } else {
            logger.warn("File with ID {} not found", id);
            return new ResponseEntity<>("File not found!", HttpStatus.NOT_FOUND);
        }
    }

}
