const GraphVisualizer = {
  networkInstance: null,

  render(containerId, graphData) {
    const container = document.getElementById(containerId);

    const nodes = new vis.DataSet(
      graphData.nodes.map(n => ({
        id: n.id,
        label: n.label,
        color: n.group === "culprit" ? "#ff4757" : "#3a7bd5",
        font: { color: "#ffffff", size: 12 },
        shape: "dot",
        size: n.group === "culprit" ? 20 : 14
      }))
    );

    const edges = new vis.DataSet(
      graphData.edges.map(e => ({
        from: e.from,
        to: e.to,
        label: e.label,
        font: { align: "top", color: "#8da2c0", size: 10 },
        color: { color: e.risk >= 0.75 ? "#ff4757" : "#ffa502" },
        width: e.risk >= 0.75 ? 2.5 : 1.5,
        smooth: { type: "continuous" }
      }))
    );

    const options = {
      physics: {
        stabilization: true,
        barnesHut: { springLength: 100, springConstant: 0.04 }
      },
      interaction: { hover: true }
    };

    if (this.networkInstance) {
      this.networkInstance.destroy();
    }

    this.networkInstance = new vis.Network(container, { nodes, edges }, options);
  }
};