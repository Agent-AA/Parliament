import commands.CommandParser;
import utils.MotionTracker;
import utils.ScreenWriter;

public class Main {
    public static void main(String[] args) {

        ScreenWriter.introScreen();

        String sessionName = ScreenWriter.readInput("\nEnter a session name: ");

        MotionTracker.getInstance().setSession(sessionName);
        MotionTracker.getInstance().bufferMotions();

        CommandParser.setSession(sessionName);

        if (MotionTracker.createDir(sessionName, "./files/")) {
            System.out.println("\n" + sessionName + " session successfully created.");
        } else {
            System.out.println("\n" + sessionName + " session opened.");
        }

        while (true) {
            CommandParser.parseCommand(ScreenWriter.readInput("\n"+ sessionName + "> "));
        }
    }
}