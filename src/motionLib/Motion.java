package motionLib;

import java.io.File;
import java.io.FileWriter;

import utils.ScreenWriter;
import utils.MotionTracker;

/**
 * Represents a motion that can be made in a session;
 */
public abstract class Motion {

    protected String
        session,
        title, // the title of the specific motion
        status, // pending, tabled, passed, failed
        motionText; // contains the text of the specific motion

    protected int motionID, yesVotes, noVotes, presentVotes, absentVotes;

    protected static String
        name, // the name of the general motion
        summary, // a brief statement of the motion's purpose
        description, // describes the purpose and function of a class of motion
        motionType; // main, subsidiary, privileged, incidental, requestionary

    protected static boolean
        amendable,
        debatable,
        secondNeeded,
        majorityNeeded,
        reconsiderable,
        superMajorityNeeded;

    protected static int precedent;

    public Motion(String title, String motionText, int motionID, String session) {
        this.title = title;
        this.motionText = motionText;
        this.motionID = motionID;
        this.session = session;
        status = "pending";

        setStaticValues();
    }

    // Overloaded constructor for loading motions from files that already have a status
    public Motion(String title, String motionText, int motionID, String session, String status, int yesVotes, int noVotes, int presentVotes, int absentVotes) {
        this.title = title;
        this.motionText = motionText;
        this.motionID = motionID;
        this.session = session;
        this.status = status;

        this.yesVotes = yesVotes;
        this.noVotes = noVotes;
        this.presentVotes = presentVotes;
        this.absentVotes = absentVotes;

        setStaticValues();
    }


    /**
     * Displays the motion in the terminal.
     */
    public void display() {
        ScreenWriter.clearScreen();

        System.out.println("MOTION ID: " + session + "-" + motionID);
        System.out.println("TYPE OF MOTION: " + name);
        System.out.println("TITLE: " + title);
        System.out.println("STATUS: " + status);
        System.out.println("\n" + motionText);
    }

    /**
     * Returns the name of a motion class
     */
    public String getMotionName() {
        return name;
    }


    /**
     * Saves the motion to a file in the session's directory.
     */
    public void save() {
        File file = new File("./files/" + session + "/" + session + "-" + motionID + ".mtn");

        try {
            FileWriter fw = new FileWriter(file);
            fw.write("TITLE: " + title + "\nTYPE OF MOTION: " + name + "\nSTATUS: " + status + "\n\nAFFIRMATIVE VOTES: " + yesVotes + "\nNEGATIVE VOTES: " + noVotes + "\nPRESENT VOTES: " + presentVotes + "\nABSENT VOTES: " + absentVotes + "\n\nTEXT: " + motionText);
            fw.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        MotionTracker.getInstance().addMotion(this);
    }


    /**
     * Sets the static values for specific types of motions
     */
    public abstract void setStaticValues();


    /**
     * Records the votes for a motion, determines pass/fail, and updates the status
     * @param yesVotes
     * @param noVotes
     * @param presentVotes
     * @param absentVotes
     */
    public void vote(int yesVotes, int noVotes, int presentVotes, int absentVotes) {
        this.yesVotes = yesVotes;
        this.noVotes = noVotes;
        this.presentVotes = presentVotes;
        this.absentVotes = absentVotes;

        // Check if the motion passed
        if (majorityNeeded && yesVotes > noVotes) {
            status = "passed";
            System.out.println("The motion passes");
            pass();
        } else if (superMajorityNeeded && yesVotes >= (yesVotes + noVotes) * 2 / 3) {
            status = "passed";
            System.out.println("The motion passes");
            pass();
        } else {
            status = "failed";
            System.out.println("The motion fails");
        }
    }


    /**
     * Actions to take when a motion passes
     */
    public abstract void pass();

    public abstract void reference();

}