import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Font;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.JTree;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {

        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("GUI App");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setLayout(new BorderLayout());

            // Left-hand column for rules with search bar at the top
            JPanel rulesPanel = new JPanel(new BorderLayout());
            JTextField searchField = new JTextField();
            JTextArea rulesArea = new JTextArea();
            rulesPanel.add(searchField, BorderLayout.NORTH);
            rulesPanel.add(new JScrollPane(rulesArea), BorderLayout.CENTER);
            rulesPanel.setPreferredSize(new Dimension(200, 0));
            frame.add(rulesPanel, BorderLayout.WEST);

            // Middle section for document, split into a larger top section and a smaller bottom section
            JPanel documentPanel = new JPanel(new BorderLayout());
            JTextArea documentArea = new JTextArea();
            JTextArea bottomArea = new JTextArea();
            bottomArea.setPreferredSize(new Dimension(0, 200)); // adjust this to change the size of the bottom section
            documentPanel.add(new JScrollPane(documentArea), BorderLayout.CENTER);
            documentPanel.add(new JScrollPane(bottomArea), BorderLayout.SOUTH);
            frame.add(documentPanel, BorderLayout.CENTER);

            // Right-hand column for motions
            JTree motionsTree = new JTree();
            JScrollPane motionsScrollPane = new JScrollPane(motionsTree);
            motionsScrollPane.setPreferredSize(new Dimension(200, 0));
            frame.add(motionsScrollPane, BorderLayout.EAST);

            // Add a large, bold title at the top center of the screen
            JLabel title = new JLabel("Parliament", SwingConstants.CENTER);
            title.setFont(new Font("Arial", Font.BOLD, 30));
            frame.add(title, BorderLayout.NORTH);

            frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
            frame.setVisible(true);
        });

    }
}
