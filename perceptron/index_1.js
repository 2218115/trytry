window.onload = () => {
  const el_canvas_plot = document.getElementById("ploting_canvas");
  const plot = create_simplot(el_canvas_plot);

  plot.draw_text(64, 64, "halo", 28, "green");
  // (min, max, step_count)
  plot.draw_relative_haxes(100, 4);
  plot.draw_relative_vaxes(100, 4);

  plot.draw_plot(25, 25, 100);
  plot.draw_linear_line(25, 25, 50, 50, 100);
}