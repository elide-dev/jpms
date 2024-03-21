
module complex {
  requires transitive java.compiler;
  requires static java.desktop;
  requires java.logging;

  exports hello;
  exports another to sample;

  uses hello.Service;
  provides hello.Service with hello.Implementation;

  opens hello;
  opens another to sample;
}
