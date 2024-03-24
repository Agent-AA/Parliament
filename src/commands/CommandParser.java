package commands;

import motionLib.*;
import utils.MotionTracker;
import utils.ScreenWriter;

/**
 * Static utility class that interprets commands from the user.
 */
public class CommandParser {

    private static String session;

    public static void setSession(String session) {
        CommandParser.session = session;
    }

    //#region help command
    private static Command help = new Command("help") {
        public void execute(String input) {
            System.out.println("""

                    [] denotes arguments

                    Name     Description
                    ----     -----------
                    (enter)  List all motions for the session
                    exit     Exit the program
                    help     Display this message
                    intro[]  Introduce a new motion
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

    //#region intro command
    // Introduce a motion
    private static Command intro = new Command("intro") {
        @SuppressWarnings("unchecked")
        public void execute(String input) {

            // Check if there is the correct number of arguments
            if (input.split(" ").length < 2) {
                System.out.println("\nInvalid arguments: the intro command requires a motion type as an argument.");
                return;
            } else if (input.split(" ").length > 2) {
                System.out.println("\nInvalid arguments: the intro command only accepts one argument.");
                return;
            }

            // Get input
            String motionType = input.split(" ")[1];
            String motionTitle = ScreenWriter.readInput("\nMotion title: ");
            String motionText = ScreenWriter.readInput("\nMotion text:\n\n");

            // Determine the motion type and save if there is one
            for (Class<Motion> motion : motionList) {
                try {
                    Motion motionInstance = motion.getDeclaredConstructor(String.class, String.class, int.class, String.class).newInstance(motionTitle,motionText,MotionTracker.getNextID(),session); // Create an instance of the Motion class
                if (motionType.equals(motionInstance.getShortName())) { // Call getMotionName() on the instance
                    motionInstance.introduce(); // take any additional actions that the motion requires
                    motionInstance.save(); // there is unfortunately no way to call reference statically like this
                    System.out.println("\nMotion successfully created.");
                    return;
                    } else {
                        System.out.println("\nInvalid motion type.");
                        return;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

        }
    };
    //#endregion

    //#region list command
    private static Command list = new Command("") {
        public void execute(String input) {
            MotionTracker.listMotions();
        }
    };
    //#endregion

    //#region disp command
    private static Command disp = new Command("disp") {

        public void execute(String input) {

            // Because the name can contain spaces, we can't split by spaces like normal
            String motionIDOrName = input.split("disp ")[1];

            // If the user has entered a number, display the motion with that ID.
            // We have to check because if it's not a number, Integer.parseInt will complain about it.
            if (motionIDOrName.matches("[0-9]+")) {

                for (Motion motion : MotionTracker.getMotionStack()) {
                    if (motion.getMotionID() == Integer.parseInt(motionIDOrName)) {
                        motion.display();
                        return;
                    }
                }
                return;
            } else { // we presume that otherwise the user has entered a name
                for (Motion motion : MotionTracker.getMotionStack()) {
                    if (motion.getTitle().toLowerCase().equals(motionIDOrName.toLowerCase())) {
                        motion.display();
                        return;
                    }
                }
            }
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
                        System.out.println(motionInstance.getShortName());
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
                    if (input.split(" ")[1].equals(motionInstance.getShortName())) { // Call getMotionName() on the instance
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
        disp,
        exit,
        help,
        intro,
        list,
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
