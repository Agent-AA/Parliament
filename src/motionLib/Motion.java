package motionLib;

/**
 * Represents a motion that can be made in a session;
 */
public abstract class Motion {

    protected String
        session,
        title, // the title of the specific motion
        status, // pending, tabled, passed, failed
        motionText; // contains the text of the specific motion

    protected int motionID;

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

    public Motion(String title, String motionText, int motionID) {
        this.title = title;
        this.motionText = motionText;
        this.motionID = motionID;
        status = "pending";

        setStaticValues();
    }

    public abstract void setStaticValues();

}