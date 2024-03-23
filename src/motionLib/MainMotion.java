package motionLib;

public class MainMotion extends Motion {

    public MainMotion(String title, String motionText, int motionID, String session) {
        super(title, motionText, motionID, session);
    }

    // Overloaded constructor for loading motions from files that already have a status and votes
    public MainMotion(String title, String motionText, int motionID, String session, String status, int yesVotes, int noVotes, int presentVotes, int absentVotes) {
        super(title, motionText, motionID, session, status, yesVotes, noVotes, presentVotes, absentVotes);
    }

    @Override
    public void introduce() {}
    
    @Override
    public void pass() {}

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
}