package cli

import (
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "duplicate-hunter",
	Short: "Find duplicate files on your computer",
	Long: `Get a list of all the duplicate files on your computer.

The files are compared directly with a sha256 hash of the file contents,
so the comparison is very accurate.  Running just the executable will
start the GUI, but you can also run it from the command line by using
the sub-commands directly.`,
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
