package main

import (
	"crypto/sha256"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type FileData struct {
	Hash     string    `json:"hash"`
	Path     string    `json:"path"`
	Size     int64     `json:"size"`
	Created  time.Time `json:"created"`
	Modified time.Time `json:"modified"`
}

type CurrentlyFound struct {
	File         FileData `json:"file"`
	CurrentCount int      `json:"count"`
}

// NormalizePath normalizes the path to use forward slashes and removes any
// trailing slashes
func NormalizePath(path string) string {
	return filepath.ToSlash(filepath.Clean(path))
}

// AppendPath appends the path to the slice, after first normalizing the path,
// but only if the path is not already in the slice or the path wouldn't already
// be a child of a path already in the slice
func AppendPath(slice []string, str string) []string {
	var newSlice []string
	keepParent := false
	str = NormalizePath(str)
	for _, s := range slice {
		if strings.HasPrefix(str, s+"/") {
			keepParent = true
		}
		if strings.HasPrefix(s, str+"/") || str == s {
			continue
		}
		newSlice = append(newSlice, s)
	}
	if !keepParent {
		newSlice = append(newSlice, str)
	}
	return newSlice
}

// hashFile returns the sha256 hash of the file at the given path
func hashFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return fmt.Sprintf("%x\n", hash.Sum(nil)), nil
}

// processFiles walks the directory tree starting at dir and sends the file
func processFiles(dir string, wg *sync.WaitGroup, fileChan chan<- FileData) {
	defer wg.Done()
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("Error walking %s: %v\n", path, err)
			return err
		}
		if !info.IsDir() {
			hash, hashErr := hashFile(path)
			if hashErr != nil {
				fmt.Printf("Error hashing %s: %v\n", path, hashErr)
				return nil
			}
			fileChan <- FileData{
				Hash:     hash,
				Path:     path,
				Size:     info.Size(),
				Created:  info.ModTime(),
				Modified: info.ModTime(),
			}
		}
		return nil
	})
	if err != nil {
		fmt.Printf("Error walking %s: %v\n", dir, err)
		return
	}
}

// processFound sorts the files into duplicates and returns a map of the duplicates
func processFound(files []FileData) map[string][]FileData {
	// sort them into duplicates
	hashToFileMap := make(map[string][]FileData)
	for _, file := range files {
		hashToFileMap[file.Hash] = append(hashToFileMap[file.Hash], file)
	}
	// remove any that don't have duplicates
	filteredMap := make(map[string][]FileData)
	for key, value := range hashToFileMap {
		if len(value) > 1 {
			filteredMap[key] = value
		}
		// Sort by smallest path first, under the assumption that the further down the
		// directory tree a file is, the more likely it is to be a duplicate
		sort.SliceStable(filteredMap[key], func(i, j int) bool {
			if len(filteredMap[key][i].Path) == len(filteredMap[key][j].Path) {
				return filteredMap[key][i].Path < filteredMap[key][j].Path
			}
			return len(filteredMap[key][i].Path) < len(filteredMap[key][j].Path)
		})
	}
	return filteredMap
}
