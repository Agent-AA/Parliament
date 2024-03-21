public class Main {
    public static void main(String[] args) {

        ScreenWriter screenWriter = ScreenWriter.getInstance();

        screenWriter.introScreen();

        Session session = new Session(screenWriter.readInput("\nEnter a session name: "));

        if (FileManager.getInstance().createDir(session.getName(), "./files/")) {
            System.out.println("\n" + session.getName() + " session successfully created.");
        } else {
            System.out.println("\n" + session.getName() + " session opened.");
        }
    }
}
