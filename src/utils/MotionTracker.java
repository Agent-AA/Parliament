package utils;
import java.io.File;
import java.util.ArrayList;
import java.util.Scanner;

import motionLib.Motion;

/**
 * Tracks the history and stack of motions.
 */
public class MotionTracker {

    private static MotionTracker instance = new MotionTracker();
    private ArrayList<Motion> motionStack = new ArrayList<Motion>();
    private String sessionName;
    private static int motionCount = 1;

    private MotionTracker() {}

    public void addMotion(Motion motion)  {
        motionStack.add(motion);
    }

    public void bufferMotions() {
        while (true) {
            File file = new File("./files/" + sessionName + "/" + sessionName + "-" + motionCount + ".mtn");
            // if the file doesn't exist, the MotionTracker stops here. Otherwise, continues
            if (!file.isFile()) {break;}
            // Read the file and "upload" a motion object
            try {
                Scanner s = new Scanner(file);

                // Retrieve all of the motion's metadata
                String title = s.nextLine().substring(7);
                String motionType = s.nextLine().substring(16);
                String status = s.nextLine().substring(8);
                s.nextLine(); // skip blank line
                int yesVotes = Integer.parseInt(s.nextLine().substring(19));
                int noVotes = Integer.parseInt(s.nextLine().substring(16));
                int presentVotes = Integer.parseInt(s.nextLine().substring(15));
                int absentVotes = Integer.parseInt(s.nextLine().substring(14));
                s.nextLine(); // skip blank line
                String motionText = s.nextLine().substring(6);

                // Create a new instance of the motion object
                @SuppressWarnings("rawtypes")
                Class motionClass = Class.forName("motionLib." + motionType.replaceAll(" ", ""));

                @SuppressWarnings("unchecked")
                Motion motion = (Motion) motionClass.getConstructor(String.class, String.class, int.class, String.class, String.class, int.class, int.class, int.class, int.class)
                    .newInstance(title, motionText, motionCount, sessionName, status, yesVotes, noVotes, presentVotes, absentVotes);

                motionStack.add(motion);

                s.close();

            } catch (Exception e) {
                e.printStackTrace();
            }

            motionCount++;
        }
    }

    /**
     * Creates a new directory
     * @param name String the file's name
     * @param path String the file's path
     * @return boolean: true if the directory was created, false if it already exists
     */
    public static boolean createDir(String name, String path) {

        File f = new File(path + name);

        return f.mkdir();
    }

    public static MotionTracker getInstance() {
        return instance;
    }

    // We have to do this in reverse order because the return will end the method
    public static int getNextID() {
        motionCount++;
        return motionCount - 1;
    }

    public void setSession(String sessionName) {
        this.sessionName = sessionName;
    }
}
