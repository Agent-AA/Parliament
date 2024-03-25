import commands.CommandParser;
import motionLib.Motion;
import utils.ReaderWriter;

public class Main {
    public static void main(String[] args) {

        ReaderWriter.introScreen();

        String session = ReaderWriter.readInput("\nEnter a session name: ");

        Motion.setSession(session);
        Motion.bufferAllMotions();

        if (ReaderWriter.createDir(session, "./files/")) {
            System.out.println("\n" + session + " session successfully created.");
        } else {
            System.out.println("\n" + session + " session opened.");
        }

        while (true) {
            CommandParser.parseCommand(ReaderWriter.readInput("\n"+ session + "> "));
        }
    }
}