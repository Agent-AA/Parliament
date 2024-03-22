package motionLib;

import utils.ScreenWriter;

public class MainMotion extends Motion {

    public MainMotion(String title, String motionText, int motionID) {
        super(title, motionText, motionID);
    }

    @Override
    public void setStaticValues() {
        name = "Main Motion";
        summary = "Bring new business before the assembly";
        description = """
            A main motion is a motion that brings business before the assembly. Main motions
            take no precedence over any other motions. They should be stated as an action to
            take rather than an action from which to refrain. Declaratory motions that offer
            no actual action are generally considered moot.
            """;
        motionType = "main";

        amendable = true;
        debatable = true;
        secondNeeded = true;
        majorityNeeded = true;
        reconsiderable = true;
        superMajorityNeeded = false;
        precedent = 0;
    }

    /**
     * Prints a reference sheet for the motion to the screen.
     */
    public static void reference() {
        ScreenWriter.clearScreen();

        System.out.println("""
            NAME: Main Motion
            SUMMARY: A motion that brings new business before the assembly

            TYPE: Main
            SECOND NEEDED: Yes
            DEBATABLE: Yes
            AMENDABLE: Yes
            VOTE NEEDED: Majority
            RECONSIDERABLE: Yes

            PRECEDENT: None

            A main motion is a motion that brings business before the assembly. Main motions
            take no precedence over any other motions. They should be stated as an action to
            take rather than an action from which to refrain. Declaratory motions that offer
            no actual action are generally considered moot.

            RONR 10:8
        """);
    }
}