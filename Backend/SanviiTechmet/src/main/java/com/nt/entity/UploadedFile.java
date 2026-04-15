package com.nt.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@Table(name = "uploaded_files")
@Data
public class UploadedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uploadedBy")  // Map to new DB column name
    private String uploadedBy;

    @Column(name = "createdDate")
    private LocalDateTime createdDate;

    @Column(name = "fileName")
    private String fileName;

    @Column(name = "fileType")
    private String fileType;

    @Column(name = "fileSize")
    private long fileSize;

    public UploadedFile(String uploadedBy, String fileName, String fileType, long fileSize) {
        this.uploadedBy = uploadedBy;
        this.createdDate = LocalDateTime.now();
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }
    public UploadedFile()
    {

    }

}
