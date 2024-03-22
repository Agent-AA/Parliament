package commands;

/**
 * Abstract class that represents a command that can be executed by the user.
 * A command has two parts: a primary keyword and an execute method. When the
 * user inputs a command, if the first word matches a Command's keyword, then
 * the Command's execute method is called. The user's input is passed as an
 * argument to the execute method.
 *
 * No two commands should have the same keyword.
 */
public abstract class Command {

    private String keyword;

    Command(String keyword) {
        this.keyword = keyword;
    }

    public abstract void execute(String input);

    public String getKeyword() {
        return keyword;
    }
}
