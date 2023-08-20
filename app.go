package main

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"sync"
)

// App struct
type App struct {
	ctx              context.Context
	startDirectories []string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Reset() {
	a.startDirectories = []string{}
}

func (a *App) SelectStartDirectories() []string {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select a directory in which to duplicates",
		CanCreateDirectories: false,
		ShowHiddenFiles:      false,
	})
	if err != nil {
		return []string{}
	}
	if selection != "" {
		a.startDirectories = AppendPath(a.startDirectories, selection)
		sort.Strings(a.startDirectories)
	}
	fmt.Println("Directories:", a.startDirectories)
	return a.startDirectories
}

func (a *App) RemoveStartDirectory(directory string) []string {
	for i, prevSelection := range a.startDirectories {
		if prevSelection == directory {
			a.startDirectories = append(a.startDirectories[:i], a.startDirectories[i+1:]...)
			break
		}
	}
	return a.startDirectories
}

func (a *App) ClearStartDirectories() []string {
	a.startDirectories = []string{}
	return a.startDirectories
}

// FindDuplicates walks the directory tree starting at each directory that has
// been chosen as a starting point, and finds any files that have duplicates
// based on the sha256 hash of the file contents
func (a *App) FindDuplicates() {
	var files []FileData
	var wg sync.WaitGroup
	fileChan := make(chan FileData)

	for _, dir := range a.startDirectories {
		wg.Add(1)
		go processFiles(dir, &wg, fileChan)
	}

	go func() {
		wg.Wait()
		close(fileChan)
	}()

	processedFiles := 0

	for {
		select {
		case file, ok := <-fileChan:
			if !ok {
				fmt.Println("\nScanning completed. Finding duplicates...")
				hashToFileMap := processFound(files)
				runtime.EventsEmit(a.ctx, "finding-complete", hashToFileMap)
				return
			}
			files = append(files, file)
			processedFiles++
			fmt.Println("Processed", processedFiles, "files - latest file:", file.Path)
			runtime.EventsEmit(a.ctx, "finding-duplicates", CurrentlyFound{File: file, CurrentCount: processedFiles})
		}
	}
}

func (a *App) OpenHostLocation(filePath string) {
	var cmd *exec.Cmd
	switch platform := runtime.Environment(a.ctx).Platform; platform {
	case "darwin":
		cmd = exec.Command("open", filePath)
		break
	case "linux":
		cmd = exec.Command("xdg-open", filePath)
		break
	case "windows":
		runDll32 := filepath.Join(os.Getenv("SYSTEMROOT"), "System32", "rundll32.exe")
		cmd = exec.Command(runDll32, "url.dll,FileProtocolHandler", filePath)
		break
	}
	err := cmd.Start()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to open file: %s", err))
	}
}
