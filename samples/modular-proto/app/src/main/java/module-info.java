module jpms.modularproto {
  requires com.google.common;
  requires com.google.protobuf;
  exports org.example.proto to com.google.protobuf;
  opens org.example.proto to com.google.protobuf;
}
