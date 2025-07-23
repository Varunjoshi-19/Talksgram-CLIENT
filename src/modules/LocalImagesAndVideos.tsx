import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"
import shareDilogStyles from "../Styling/ShareDilog.module.css";
import React from "react";



interface BoxPayload {
    item: string;
    type: string;
    setCloseImage: React.Dispatch<React.SetStateAction<boolean>>;
}


function LocalImagesAndVideos({ item, type, setCloseImage }: BoxPayload) {
    return (
        <div className={shareDilogStyles.blackBehindContainer}>

            <div className={shareDilogStyles.crossButton} >
                <X onClick={() => setCloseImage(prev => !prev)} />
            </div>

            <div style={{ width: "500px", height: "700px" }}>
                <AnimatePresence>
                    {item && type == "image" ? (
                        <motion.img
                            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" , cursor : "pointer" }}
                            src={item}
                            alt="enlarged"
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.3, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={(e) => e.stopPropagation()}
                        />

                    )

                        :

                        (
                            <motion.video
                                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" , cursor : "pointer" }}
                                src={item}
                                controls
                                autoPlay
                                initial={{ scale: 0.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.3, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        )

                    }
                </AnimatePresence>
            </div>

        </div>
    )
}

export default LocalImagesAndVideos
