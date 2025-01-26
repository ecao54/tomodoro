import * as React from "react";
import {Text, StyleSheet, View, Modal, TouchableOpacity} from "react-native";

const Dialog = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.frameParent}>
          <View style={styles.saveTimerDurationsParent}>
            <Text style={styles.saveTimerDurations}>save timer durations</Text>
            <Text style={styles.thisWillRestart}>
              this will restart your current session.{'\n'}
              are you sure you want to save?
            </Text>
          </View>
          <View style={styles.buttonParent}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonFlexBox]}
              onPress={onConfirm}
            >
              <Text style={[styles.saveAndRestart, styles.cancelTypo]}>
                save and restart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button1, styles.buttonFlexBox]}
              onPress={onCancel}
            >
              <Text style={[styles.cancel, styles.cancelTypo]}>cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    frameParent: {
        backgroundColor: '#FDFAF6',
        padding: 24,
        borderRadius: 16,
        width: '80%',
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 20,
        alignItems: "center"

    },
    buttonFlexBox: {
        paddingVertical: 14,
        paddingHorizontal: 0,
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: 10,
        alignSelf: "stretch",
        alignItems: "center",
  	},
  	cancelTypo: {
    		textAlign: "left",
    		fontSize: 18,
    		fontFamily: "Anuphan-SemiBold",
    		fontWeight: "600"
  	},
  	saveTimerDurations: {
    		fontSize: 24,
    		textAlign: "center",
    		color: "#151514",
    		fontFamily: "Anuphan-SemiBold",
    		fontWeight: "600",
    		alignSelf: "stretch"
  	},
  	thisWillRestart: {
    		fontFamily: "Anuphan-Regular",
    		fontSize: 18,
    		textAlign: "center",
    		color: "#151514",
    		alignSelf: "stretch"
  	},
  	saveTimerDurationsParent: {
    		gap: 8,
    		alignSelf: "stretch",
    		alignItems: "center"
  	},
  	saveAndRestart: {
    		color: "#fdfaf6"
  	},
  	button: {
    		backgroundColor: "#a81f10"
  	},
  	cancel: {
    		color: "#535350"
  	},
  	button1: {
    		backgroundColor: "#e4e0d9"
  	},
  	buttonParent: {
    		gap: 12,
    		alignSelf: "stretch"
  	}
});

export default Dialog;
