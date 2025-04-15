package com.calculator;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import org.mariuszgromada.math.mxparser.*;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

public class MegaCalculator extends Application {

    private TextArea historyArea;
    private TextField inputField;
    private final Map<String, Double> memory = new HashMap<>();
    private final Map<String, String> userVariables = new HashMap<>();
    private final List<String> history = new ArrayList<>();
    private final Canvas graphCanvas = new Canvas(600, 400);
    private double mValue = 0;

    public static void main(String[] args) {
        mXparser.disableAlmostIntRounding();
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        historyArea = new TextArea();
        historyArea.setEditable(false);
        historyArea.setWrapText(true);

        inputField = new TextField();
        inputField.setPromptText("Enter expression (e.g. 2+2, sin(45), x=5, y=f(x))");
        inputField.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER) {
                String input = inputField.getText();
                String result = evaluate(input);
                history.add(input + " = " + result);
                historyArea.appendText(input + " = " + result + "\n");
                inputField.clear();
                drawGraphIfNeeded(input);
            }
        });

        Button historyButton = new Button("History");
        historyButton.setOnAction(e -> showHistory());

        Button clearMemory = new Button("MC");
        clearMemory.setOnAction(e -> memory.clear());

        Button memoryAdd = new Button("M+");
        memoryAdd.setOnAction(e -> mValue += memory.getOrDefault("Ans", 0.0));

        Button memorySub = new Button("M-");
        memorySub.setOnAction(e -> mValue -= memory.getOrDefault("Ans", 0.0));

        Button memoryRecall = new Button("MR");
        memoryRecall.setOnAction(e -> inputField.setText(inputField.getText() + mValue));

        HBox topControls = new HBox(10, historyButton, clearMemory, memoryAdd, memorySub, memoryRecall);
        topControls.setPadding(new Insets(10));

        VBox bottomSection = new VBox(inputField, graphCanvas);

        BorderPane root = new BorderPane();
        root.setTop(topControls);
        root.setCenter(historyArea);
        root.setBottom(bottomSection);

        Scene scene = new Scene(root, 900, 700, Color.DARKSLATEGRAY);
        primaryStage.setTitle("Mega Calculator");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    private String evaluate(String input) {
        try {
            if (input.contains("=") && !input.trim().endsWith("=")) {
                String[] parts = input.split("=");
                String var = parts[0].trim();
                String expression = parts[1];
                for (String key : userVariables.keySet()) {
                    expression = expression.replaceAll("\\b" + key + "\\b", userVariables.get(key));
                }
                Expression exp = new Expression(expression);
                double value = exp.calculate();
                memory.put(var, value);
                userVariables.put(var, expression);
                return String.valueOf(value);
            } else {
                for (String key : memory.keySet()) {
                    input = input.replaceAll("\\b" + key + "\\b", memory.get(key).toString());
                }
                for (String key : userVariables.keySet()) {
                    input = input.replaceAll("\\b" + key + "\\b", userVariables.get(key));
                }
                Expression exp = new Expression(input);
                double value = exp.calculate();
                memory.put("Ans", value);
                return String.valueOf(value);
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private void showHistory() {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Calculation History");
        alert.setHeaderText("Recent Calculations");
        StringBuilder sb = new StringBuilder();
        for (String h : history) {
            sb.append(h).append("\n");
        }
        alert.setContentText(sb.toString());
        alert.showAndWait();
    }

    private void drawGraphIfNeeded(String input) {
        if (input.matches("y\\s*=.*x.*")) {
            String[] parts = input.split("=");
            String expr = parts[1].trim();
            drawGraph(expr);
        } else if (input.matches("polar\\s*=.*r.*")) {
            String[] parts = input.split("=");
            String expr = parts[1].trim();
            drawPolarGraph(expr);
        }
    }

    private void drawGraph(String expression) {
        GraphicsContext gc = graphCanvas.getGraphicsContext2D();
        gc.clearRect(0, 0, graphCanvas.getWidth(), graphCanvas.getHeight());

        double width = graphCanvas.getWidth();
        double height = graphCanvas.getHeight();
        double midX = width / 2;
        double midY = height / 2;

        gc.setStroke(Color.LIGHTGRAY);
        gc.strokeLine(0, midY, width, midY);
        gc.strokeLine(midX, 0, midX, height);

        gc.setStroke(Color.CYAN);

        Double prevY = null;
        for (int px = 0; px < width; px++) {
            double x = (px - midX) / 40.0;
            Expression exp = new Expression(expression.replaceAll("x", "(" + x + ")"));
            double y = exp.calculate();
            int py = (int) (midY - y * 40);
            if (prevY != null && !Double.isNaN(prevY) && !Double.isNaN(y)) {
                gc.strokeLine(px - 1, prevY, px, py);
            }
            prevY = (double) py;
        }
    }

    private void drawPolarGraph(String expression) {
        GraphicsContext gc = graphCanvas.getGraphicsContext2D();
        gc.clearRect(0, 0, graphCanvas.getWidth(), graphCanvas.getHeight());

        double width = graphCanvas.getWidth();
        double height = graphCanvas.getHeight();
        double midX = width / 2;
        double midY = height / 2;

        gc.setStroke(Color.LIGHTGRAY);
        gc.strokeLine(0, midY, width, midY);
        gc.strokeLine(midX, 0, midX, height);

        gc.setStroke(Color.CYAN);

        Double prevX = null, prevY = null;
        for (int i = 0; i < 360; i++) {
            double theta = Math.toRadians(i);
            Expression exp = new Expression(expression.replaceAll("r", "(" + theta + ")"));
            double r = exp.calculate();
            int px = (int) (midX + r * Math.cos(theta) * 40);
            int py = (int) (midY - r * Math.sin(theta) * 40);

            if (prevX != null && prevY != null) {
                gc.strokeLine(prevX, prevY, px, py);
            }
            prevX = (double) px;
            prevY = (double) py;
        }
    }
}
