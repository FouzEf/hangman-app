plugins {

  id("com.google.gms.google-services") version "4.4.3" apply false
  id("com.android.application")
  id("com.google.gms.google-services")

}

dependencies {
  implementation(platform("com.google.firebase:firebase-bom:34.3.0"))
  implementation("com.google.firebase:firebase-analytics")
}