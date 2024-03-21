public class ScreenWriter {

    static final ScreenWriter instance = new ScreenWriter();

    private ScreenWriter() {}

    public void introScreen() {
        System.out.println(" _____           _ _                            _   ");
        System.out.println("|  __ \\         | (_)                          | |  ");
        System.out.println("| |__) |_ _ _ __| |_  __ _ _ __ ___   ___ _ __ | |_ ");
        System.out.println("|  ___/ _` | '__| | |/ _` | '_ ` _ \\ / _ \\ '_ \\| __|");
        System.out.println("| |  | (_| | |  | | | (_| | | | | | |  __/ | | | |");
        System.out.println("|_|   \\__,_|_|  |_|_|\\__,_|_| |_| |_|\\___|_| |_|\\__|");
    }

    public static ScreenWriter getInstance() {
        return instance;
    }
}
