package motionLib;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Scanner;

import utils.ReaderWriter;

/**
 * Represents a motion that can be made in a session;
 */
public abstract class Motion {

    // These are associated ONLY with the Motion class and not its subclasses
    private static ArrayList<Motion> motionList = new ArrayList<Motion>();
    protected static String session;
    private static int motionCount = 1;

    protected String
        title, // the title of the specific motion
        status, // pending, tabled, passed, failed
        motionText; // the citation for the motion in Robert's Rules of Order

    protected int motionID,
        // all motions start with zero votes
        yesVotes = 0,
        noVotes = 0,
        presentVotes = 0,
        absentVotes = 0;

    // Static values are associated with a general class of motions rather than particular instances
    protected static String
        name, // the name of the general motion. This MUST be the same as the class name sans spaces.
        shortName, // a shortened version of the motion name used for commands. Usually omits the "motion to" part
        summary, // a brief statement of the motion's purpose
        description, // describes the purpose and function of a class of motion
        motionType, // main, subsidiary, privileged, incidental, requestionary
        citation; // the citation for the motion in Robert's Rules of Order

    protected static boolean
        amendable,
        debatable,
        secondNeeded,
        majorityNeeded,
        reconsiderable,
        superMajorityNeeded;

    protected static int precedent;

    public Motion() {
        status = "pending"; // we could technically declare this at initialization, but it's better to keep everything together
        motionID = getNextID();
        setStaticValues();
    }

    /**
     * Adds a motion to the list of motions in this session
     * @param motion
     */
    public static void addMotionToList(Motion motion) {
        motionList.add(motion);
    }

    /**
     * Iteratively calls motions to be loaded from a file
     */
    public static void bufferAllMotions() {
        while (true) {

            // this produces a filepath that looks something like "./files/session/session-1.mtn"
            File file = new File("./files/" + session + "/" + session + "-" + motionCount + ".mtn");

            if (!file.isFile()) {break;}

            try {
                Scanner s = new Scanner(file);

                // retrieve the motion's type
                s.nextLine(); // we skip a line because the first one is the motion's title
                String motionType = s.nextLine().split("TYPE OF MOTION: ")[1];

                s.close();

                // create a new instance of the appropriate motion type
                @SuppressWarnings("rawtypes")
                Class motionClass = Class.forName("motionLib." + motionType.replaceAll(" ", ""));

                // we let the motion subclass handle the rest of the buffering (loading) because the details vary by motion type

                @SuppressWarnings("unchecked")
                Motion motion = (Motion) motionClass.getConstructor().newInstance();

                motion.buffer(file);
                motionList.add(motion);

            } catch (Exception e) {
                e.printStackTrace();
            }

        }
    }

    /**
     * Decrements the motionCount in cases where we want to create dummy instance of
     * motions but not actually increment the count, such as when we're searching for a motion
     */
    public static void decrementMotionCount() {
        motionCount--;
    }


    /**
     * Displays the motion instance in the terminal
     */
    public void display() {
        ReaderWriter.clearScreen();

        System.out.println("MOTION ID: " + session + "-" + motionID);
        System.out.println("TYPE OF MOTION: " + name);
        System.out.println("TITLE: " + title);
        System.out.println("STATUS: " + status);

        if (status.equals("passed") || status.equals("failed")) {
            System.out.println("\nAFFIRMATIVE VOTES: " + yesVotes);
            System.out.println("NEGATIVE VOTES: " + noVotes);
            System.out.println("PRESENT VOTES: " + presentVotes);
            System.out.println("ABSENT VOTES: " + absentVotes);
        }

        System.out.println("\n" + motionText);
    }

    /**
     * @return int motion's id
     */
    public int getMotionID() {
        return motionID;
    }

    /**
     * @return an ID for the next motion to be created
     */
    public static int getNextID() {
        motionCount++;
        return motionCount - 1;
    }

    /**
     * @return the ArrayList of motions for the session
     */
    public static ArrayList<Motion> getMotionList() {
        return motionList;
    }

    /**
     *
     * @return the motion's title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Returns the name of a motion class
     */
    public String getShortName() {
        return shortName;
    }

    /**
     *
     * @return the motion's status
     */
    public String getStatus() {
        return status;
    }

    /**
     * Lists all motions in the current session
     */
    public static void listMotions() {
        System.out.println("\nMotions in this session:\n");

        // we flip the stack so the most recent motions are first
        Collections.reverse(motionList);
        for (Motion motion : motionList) {
            System.out.println("#" + motion.getMotionID() + " " + motion.getTitle() + " (" + motion.getStatus() + ")");
        }
        Collections.reverse(motionList);
    }

    public static Motion lookUpMotion(String motionIDOrName) {

        // If the user has entered a number, display the motion with that ID.
        // We have to check because if it's not a number, Integer.parseInt will complain about it.
        if (motionIDOrName.matches("[0-9]+")) {

            for (Motion motion : Motion.getMotionList()) {
                if (motion.getMotionID() == Integer.parseInt(motionIDOrName)) {
                    return motion;
                }
            }
        } else { // we presume that otherwise the user has entered a name
            for (Motion motion : Motion.getMotionList()) {
                if (motion.getTitle().toLowerCase().equals(motionIDOrName.toLowerCase())) {
                    return motion;
                }
            }
        }

        /* if neither of those work for some weird reason. This should only happen if the user
         gives bad input */
        System.out.println("Motion not found");
        Motion.decrementMotionCount(); // we don't want to increment the motion count if we're just passing a dummy motion
        return new MainMotion(); // TODO make a better error handling solution
    }

    /**
     * Displays reference information for a motion.
     */
    public static void reference() {

        System.out.println(
            "\nNAME: " + name +
            "\nSUMMARY: " + summary +
            "\n\nTYPE: " + motionType +
            "\nSECOND NEEDED: " + secondNeeded +
            "\nDEBATABLE: " + debatable +
            "\nAMENDABLE: " + amendable +
            "\nVOTE NEEDED: " + majorityNeeded +
            "\nRECONSIDERABLE: " + reconsiderable +
            "\n\nPRECEDENT: " + precedent +
            "\n\n" + description +
            "\n" + citation
        );
    }

    /**
     * Saves the motion to a file in the session's directory. This method is
     * abstract because the information saved varies by motion type.
     */
    public abstract void save();

    /**
     * Sets the session name for the Motion class to use in creating motions
     * @param sessionName String
     */
    public static void setSession(String session) {
        Motion.session = session;
    }

    /**
     * Sets the static values for specific types of motions
     */
    public abstract void setStaticValues();


    /**
     * Records the votes for a motion, determines pass/fail, and updates the status.
     * Technically, present and absent votes don't matter, but they're recorded anyway.
     * @param votes [0] yes, [1] no, [2] present, [3] absent
     */
    public void vote(int ... votes) {
        yesVotes = votes[0];
        noVotes = votes[1];
        presentVotes = votes[2];
        absentVotes = votes[3];

        // Check if the motion passed. It passes with either a majority or a supermajority, whichever necessary
        if ((majorityNeeded && yesVotes > noVotes) || (superMajorityNeeded && yesVotes > (yesVotes + noVotes) * 2 / 3)) {
            status = "passed";
            System.out.println("The motion passes");
            pass();
        } else {
            status = "failed";
            System.out.println("The motion fails");
        }
    }

    //#region Abstract Methods

    /**
     * Called to load a motion from a file.
     */
    public abstract void buffer(File file);

    /**
     * Actions to take when a motion is first introduced. This is
     * used for things like assigning which motion a subsidiary affects.
     */
    public abstract void introduce();

    /**
     * Actions to take when a motion passes
     */
    public abstract void pass();

    //#endregion
}