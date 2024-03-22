package utils;

import motionLib.MainMotion;
import motionLib.Motion;

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

    private static Command reference = new Command("ref") {
        @SuppressWarnings("unchecked")
        public void execute(String input) {
            for (Class<Motion> motion : motionList) {
                try {
                    Motion motionInstance = motion.getDeclaredConstructor(String.class, String.class, int.class, String.class).newInstance("","",0,""); // Create an instance of the Motion class
                if (input.split(" ")[1].equals(motionInstance.getMotionName())) { // Call getMotionName() on the instance
                    motionInstance.reference(); // Call reference() on the instance
                    return;
                    }
                } catch (Exception e) {
                    e.printStackTrace();

                }
            }
        }
    };

    //#region Motion commands
    @SuppressWarnings("rawtypes")
    private static Class[] motionList = {
        MainMotion.class
    };


    // This is the array of commands that the parseCommand method uses
    private static Command[] commandList = {
        help,
        exit,
        reference
    };

    // The quintessential method for receiving and interpreting commands. This should never be touched
    public static void parseCommand(String input) {

        ScreenWriter.introScreen();
        for (Command cmd : commandList) {
            if (input.split(" ")[0].equals(cmd.keyword)) {
                cmd.execute(input);
                return;
            }
        }
    }
}
