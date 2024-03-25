package motionLib;

import java.io.File;
import java.io.FileWriter;
import java.util.Scanner;

import utils.ReaderWriter;

public class MainMotion extends Motion {

    @Override
    public void setStaticValues() { // static values are set in this function rather than the constructor
        name = "Main Motion";
        shortName = "main";
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
        citation = "RONR 10:8";
    }

    @Override
    public void buffer(File file) {

        try {
            Scanner s = new Scanner(file);

            title = s.nextLine().split("TITLE: ")[1];
            s.nextLine(); // skip the motionType line; we already know it's a main motion
            status = s.nextLine().split("STATUS: ")[1];
            s.nextLine(); // skip empty line
            yesVotes = Integer.parseInt(s.nextLine().split("AFFIRMATIVE VOTES: ")[1]);
            noVotes = Integer.parseInt(s.nextLine().split("NEGATIVE VOTES: ")[1]);
            presentVotes = Integer.parseInt(s.nextLine().split("PRESENT VOTES: ")[1]);
            absentVotes = Integer.parseInt(s.nextLine().split("ABSENT VOTES: ")[1]);
            s.nextLine(); // skip empty line
            motionText = s.nextLine().split("TEXT: ")[1];

            s.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void introduce() {
        title = ReaderWriter.readInput("\nMotion Title: ");
        motionText = ReaderWriter.readInput("\nMotion Text:\n\n");
    }

    @Override
    public void pass() {}

    @Override
    public void save() {

        File file = new File("./files/" + Motion.session + "/" + Motion.session + "-" + motionID + ".mtn");

        try {
            FileWriter fw = new FileWriter(file);
            fw.write(
                "TITLE: " + title +
                "\nTYPE OF MOTION: " + name +
                "\nSTATUS: " + status +

                "\n\nAFFIRMATIVE VOTES: " + yesVotes +
                "\nNEGATIVE VOTES: " + noVotes +
                "\nPRESENT VOTES: " + presentVotes +
                "\nABSENT VOTES: " + absentVotes +

                "\n\nTEXT: " + motionText
            );

            fw.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Add the motion to the list of motions if it's not already there
        if (!Motion.getMotionList().contains(this)) {
            Motion.addMotionToList(this);
        }
    }
}