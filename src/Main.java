import motionLib.MainMotion;
import utils.FileManager;
import utils.MotionTracker;
import utils.ScreenWriter;

public class Main {
    public static void main(String[] args) {

        ScreenWriter.introScreen();

        String sessionName = ScreenWriter.readInput("\nEnter a session name: ");

        MotionTracker.getInstance().setSession(sessionName);
        MotionTracker.getInstance().bufferMotions();

        if (FileManager.createDir(sessionName, "./files/")) {
            System.out.println("\n" + sessionName + " session successfully created.");
        } else {
            System.out.println("\n" + sessionName + " session opened.");
        }

        MainMotion motion = new MainMotion(("A motion to introduce a new system of government"), "We want to form a new government", 1, sessionName);
        motion.save();
    }
}