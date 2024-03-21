import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class ScreenWriter {

    static final ScreenWriter instance = new ScreenWriter();

    private ScreenWriter() {}

    public void introScreen() {
        System.out.println(" _____           _ _                            _   ");
        System.out.println("|  __ \\         | (_)                          | |  ");
        System.out.println("| |__) |_ _ _ __| |_  __ _ _ __ ___   ___ _ __ | |_ ");
        System.out.println("|  ___/ _` | '__| | |/ _` | '_ ` _ \\ / _ \\ '_ \\| __|");
        System.out.println("| |  | (_| | |  | | | (_| | | | | | |  __/ | | | |");
        System.out.println("|_|   \\__,_|_|  |_|_|\\__,_|_| |_| |_|\\___|_| |_|\\__|");
    }

    /**
     * Reads input from the terminal
     * @param prompt String to prompt the user
     * @return String input or null if no input.
     */
    public String readInput (String prompt) {

        String input = null;

        // Display the prompt
        System.out.print(prompt);

        // Enter data using BufferReader
        BufferedReader reader = new BufferedReader(
        new InputStreamReader(System.in));

        try {
            // Reading data using readLine
            input = reader.readLine();
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Printing the read line
        return input;
    }

    public static ScreenWriter getInstance() {
        return instance;
    }
}
