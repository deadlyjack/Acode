public class SynchronizedDictionary<KeyType:Hashable, ValueType> {
    private var dictionary: [KeyType:ValueType] = [:]
    private let accessQueue = DispatchQueue(label: "SynchronizedDictionaryAccess", attributes: .concurrent)

    public func removeValue(forKey: KeyType) {
        self.accessQueue.async(flags:.barrier) {
            self.dictionary.removeValue(forKey: forKey)
        }
    }

    public subscript(key: KeyType) -> ValueType? {
        set {
            self.accessQueue.async(flags:.barrier) {
                self.dictionary[key] = newValue
            }
        }
        get {
            var element: ValueType?
            self.accessQueue.sync {
                element = self.dictionary[key]
            }
            return element
        }
    }
}
