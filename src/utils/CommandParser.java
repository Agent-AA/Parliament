package utils;
/**
 * Static utility class that interprets commands from the user.
 */
public class CommandParser {

    // COMMANDS - commands are structured with a keyword and an execute method.
    // The keyword must be passed as an argument to the Command constructor while the
    // execute method must be defined in the command's body.
    public abstract static class Command {
        public String keyword;
        Command(String keyword) {
            this.keyword = keyword;
        }
        public abstract void execute(String input);
    }

    private static Command help = new Command("help") {
        public void execute(String input) {
            System.out.println("""

                    Commands:

                    help     exit
                """);
            }
        };

    private static Command exit = new Command("exit") {
        public void execute(String input) {
            System.exit(0);
        }
    };




    // This is the array of commands that the parseCommand method uses
    private static Command[] commands = {
        help,
        exit
    };

    // The quintessential method for receiving and interpreting commands. This should never be touched
    public static void parseCommand(String input) {

        ScreenWriter.introScreen();
        for (Command cmd : commands) {
            if (input.split(" ")[0].equals(cmd.keyword)) {
                cmd.execute(input);
                return;
            }
        }
    }
}
