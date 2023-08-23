package cli

import (
	"fmt"
	"github.com/amnuts/duplicate-hunter/utils"
	"github.com/spf13/cobra"
	"sync"
)

var inputDirs []string

var findCmd = &cobra.Command{
	Use:   "find",
	Short: "Find the duplicate files on your computer",
	Long:  "",
	Run: func(cmd *cobra.Command, args []string) {
		var files []utils.FileData
		var wg sync.WaitGroup
		fileChan := make(chan utils.FileData)

		for _, dir := range inputDirs {
			wg.Add(1)
			go utils.ProcessFiles(dir, &wg, fileChan)
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
					hashToFileMap := utils.ProcessFound(files)
					fmt.Println("Found", len(hashToFileMap), "duplicates")
					fmt.Println(hashToFileMap)
					return
				}
				files = append(files, file)
				processedFiles++
				fmt.Print("\033[?25l")
				fmt.Print("\u001b[1K\r")
				fmt.Print("\rProcessed ", processedFiles)
				fmt.Print("\033[?25h")
			}
		}
	},
}

func init() {
	rootCmd.AddCommand(findCmd)
	findCmd.Flags().StringSliceVarP(&inputDirs, "dir", "d", []string{}, "Input directories")
	if err := findCmd.MarkFlagRequired("dir"); err != nil {
		fmt.Println("\nYou need to supply one or more directories with the '-d' option\n")
	}
}
