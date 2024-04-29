package commands;

import motionLib.*;
import utils.ReaderWriter;

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
                    (enter)  List all motions for the session
                    delete[] Delete a motion; enter its ID or name
                    disp[]   Display a motion; enter its ID or name
                    exit     Exit the program
                    help     Display this message
                    intro[]  Introduce a new motion; enter its type
                    ref[]    Reference a type of motion; enter its type
                    vote[]   Vote on a motion; enter its ID or name""");
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

    //#region del command
    private static Command delete = new Command("del") {

        public void execute(String input) {

            String motionIDOrName = input.split(" ")[1];

            // Look up the motion
            Motion motion = Motion.lookUpMotion(motionIDOrName);

            // Delete the motion
            motion.delete();
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

            // Get motion type
            String motionType = input.split(" ")[1];

            // Determine the motion type and save if there is one
            for (Class<Motion> motion : motionList) {
                try {
                    Motion motionInstance = motion.getDeclaredConstructor().newInstance(); // Create an instance of the Motion class
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
            Motion.listMotions();
        }
    };
    //#endregion

    //#region disp command
    private static Command disp = new Command("disp") {

        public void execute(String input) {

            String motionIDOrName = input.split(" ")[1];

            // Look up the motion
            Motion motion = Motion.lookUpMotion(motionIDOrName);

            // Display the motion
            motion.display();
        }
    };
    //#endregion

    //#region vote command
    private static Command vote = new Command("vote") {

        public void execute(String input) {

                String motionIDOrName = input.split(" ")[1];

                // Look up the motion
                Motion motion = Motion.lookUpMotion(motionIDOrName);

                // Display the motion
                motion.display();

                String votes = ReaderWriter.readInput("\nEnter votes (yes no present absent): ");

                motion.vote(votes);
                motion.save();
        }
    };
    //#endregion

    /* MOTION REFERENCE LIST - this array is used by several functions to
       look up motions */
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
                        Motion motionInstance = motion.getDeclaredConstructor().newInstance();
                        Motion.decrementMotionCount(); // creating the dummy instance above increments the motion count, but we don't want that, so we reverse it
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
                        Motion motionInstance = motion.getDeclaredConstructor().newInstance(); // Create a dummy instance of the desired motion's class
                        Motion.decrementMotionCount(); // creating the dummy instance above increments the motion count, but we don't want that, so we reverse it
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
        delete,
        disp,
        exit,
        help,
        intro,
        list,
        reference,
        vote
    };

    // The quintessential method for receiving and interpreting commands. This should never be touched
    public static void parseCommand(String input) {

        ReaderWriter.introScreen();
        for (Command cmd : commandList) {
            if (input.split(" ")[0].equals(cmd.getKeyword())) {
                cmd.execute(input);
                return;
            }
        }
    }
    //#endregion
}
