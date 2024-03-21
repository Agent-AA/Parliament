import java.io.File;

public class FileManager {

    static final FileManager instance = new FileManager();

    private FileManager() {}

    /**
     * @return the global FileManager instance
     */
    public static FileManager getInstance() {
        return instance;
    }

    /**
     * Creates a new directory
     * @param name String the file's name
     * @param path String the file's path
     * @return boolean: true if the directory was created, false if it already exists
     */
    public boolean createDir(String name, String path) {

        File f = new File(path + name);

        return f.mkdir();
    }
}