package com.nt.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.nt.entity.UploadedFile;
import com.nt.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nt.jwt.JwtService;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/file")
public class FileController {
    
    @Autowired
    private JwtService jwtService;

	@Autowired
	private FileService fileService;


	@PostMapping("/upload")
	public ResponseEntity<List<UploadedFile>> uploadFiles(
			@RequestParam("files") MultipartFile[] files,
			@RequestParam("uploadedBy") String uploadedBy) {
		try {
			List<UploadedFile> savedFiles = fileService.saveFiles(files, uploadedBy);
			return ResponseEntity.ok(savedFiles);
		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@GetMapping("/get-file-content/{id}")
	public ResponseEntity<String> getFileById(@PathVariable Long id) {
		try {
			return fileService.getFileContent(id);
		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Error reading file: " + e.getMessage());
		}
	}

	@PutMapping("/update/{fileId}")
	public ResponseEntity<String> updateFileContent(@PathVariable Long fileId, @RequestBody Map<String, String> requestBody) throws IOException {
		String newContent = requestBody.get("newContent");
		return fileService.updateFileContent(fileId, newContent);
	}

//	@GetMapping("/get-all-files")
//	public ResponseEntity<Page<UploadedFile>> getAllFiles(
//			@RequestParam(defaultValue = "0") int page,
//			@RequestParam(defaultValue = "10") int size,
//			@RequestParam(defaultValue = "id") String sortBy,
//			@RequestParam(defaultValue = "asc") String sortDir) {
//		Page<UploadedFile> files = fileService.getAllFiles(page, size, sortBy, sortDir);
//		return ResponseEntity.ok(files);
//	}
//
//	@GetMapping("/filter")
//	public ResponseEntity<List<UploadedFile>> filterFiles(
//			@RequestParam(required = false) String fileName,
//			@RequestParam(required = false) String uploadedBy,
//			@RequestParam(required = false) String startDate,
//			@RequestParam(required = false) String endDate) {
//
//		List<UploadedFile> filteredFiles = fileService.getFilteredFiles(fileName, uploadedBy, startDate, endDate);
//		return ResponseEntity.ok(filteredFiles);
//	}

	@GetMapping("/filter")
	public ResponseEntity<Page<UploadedFile>> getFilteredFiles(
			@RequestParam(required = false) String fileName,
			@RequestParam(required = false) String uploadedBy,
			@RequestParam(required = false) String startDate,
			@RequestParam(required = false) String endDate,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "id") String sortBy,
			@RequestParam(defaultValue = "desc") String sortDir) {

		Page<UploadedFile> files = fileService.getFilteredFiles(
				fileName, uploadedBy, startDate, endDate, page, size, sortBy, sortDir);
		return ResponseEntity.ok(files);
	}


	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteFile(@PathVariable Long id) {
		return fileService.deleteFileById(id);
	}


}
