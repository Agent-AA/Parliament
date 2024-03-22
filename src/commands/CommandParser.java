package commands;

import motionLib.*;
import utils.ScreenWriter;

/**
 * Static utility class that interprets commands from the user.
 */
public class CommandParser {

    //#region help command
    private static Command help = new Command("help") {
        public void execute(String input) {
            System.out.println("""

                    [] denotes arguments

                    Name     Description
                    ----     -----------
                    exit     Exit the program
                    help     Display this message
                    ref[]    Reference a type of motion""");
            }
        };
    //#endregion

    //#region exit command
    private static Command exit = new Command("exit") {
        public void execute(String input) {
            System.exit(0);
        }
    };
    //#endregion


    // MOTION REFERENCE LIST - this array is used by several functions to
    // look up motions.
    @SuppressWarnings("rawtypes")
    private static Class[] motionList = {
        MainMotion.class
    };

    //#region reference command
    /**
     * Displays reference information for a class of motions. Motions
     * must be added to the motionList array in order to be referenced.
     */
    private static Command reference = new Command("ref") {

        @SuppressWarnings({ "unchecked", "static-access" })
        public void execute(String input) {

            // if the user has not specified a motion with the reference command,
            // list all motions
            if (input.split(" ").length < 2) {
                System.out.println("\n\nAll motions: ");
                for (Class<Motion> motion : motionList) {
                    try {
                        Motion motionInstance = motion.getDeclaredConstructor(String.class, String.class, int.class, String.class).newInstance("","",0,"");
                        System.out.println(motionInstance.getMotionName());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                return;

            // if the user HAS specified a motion, search the motionList and disply it for them
            } else if (input.split(" ").length == 2) {
                for (Class<Motion> motion : motionList) {
                    try {
                        Motion motionInstance = motion.getDeclaredConstructor(String.class, String.class, int.class, String.class).newInstance("","",0,""); // Create an instance of the Motion class
                    if (input.split(" ")[1].equals(motionInstance.getMotionName())) { // Call getMotionName() on the instance
                        motionInstance.reference(); // there is unfortunately no way to call reference statically like this
                        return;
                        }
                    } catch (Exception e) {
                        e.printStackTrace();

                    }
                }
                return;

            // if the user has specified too many arguments, prompt them to specify only one
            } else {
                System.out.println("\nInvalid arguments: the ref command only accepts one argument.");
                return;
            }
        }
    };
    //#endregion

    //#region commandParsing
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
            if (input.split(" ")[0].equals(cmd.getKeyword())) {
                cmd.execute(input);
                return;
            }
        }
    }
    //#endregion
}
