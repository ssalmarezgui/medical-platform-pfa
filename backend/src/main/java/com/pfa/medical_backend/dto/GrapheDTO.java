package com.pfa.medical_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
public class GrapheDTO {
    private List<Node> nodes;
    private List<Edge> edges;

    @Data
    @AllArgsConstructor
    public static class Node {
        private String id;
        private String label;
        private String name;
    }

    @Data
    @AllArgsConstructor
    public static class Edge {
        private String source;
        private String target;
        private String relation;
    }
}